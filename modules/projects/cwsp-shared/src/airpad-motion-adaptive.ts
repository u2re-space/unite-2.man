/**
 * Adaptive AirPad motion rate (IPS / Hz) — client send cadence + desk apply governor.
 * Tiers: 120 → 90 → 60 → 30 when the channel cannot keep pace.
 */
import { isGatewayHttpsOrigin, isOffHomeFleetNetwork } from "./airpad-cwsp-client-parity.ts";

export const AIRPAD_MOTION_IPS_TIERS = [120, 90, 60, 30] as const;

/** @deprecated use {@link AIRPAD_MOTION_IPS_TIERS} */
export const AIRPAD_MOTION_HZ_TIERS = AIRPAD_MOTION_IPS_TIERS;

export type AirpadMotionIpsTier = (typeof AIRPAD_MOTION_IPS_TIERS)[number];

/** @deprecated use {@link AirpadMotionIpsTier} */
export type AirpadMotionHzTier = AirpadMotionIpsTier;

export const motionIntervalMsForHz = (hz: number): number =>
    Math.max(1, Math.round(1000 / Math.max(1, hz)));

export const motionIntervalMsForIps = motionIntervalMsForHz;

export type AirpadMotionPathClass = "lan" | "wan" | "wan-wan";

export type AirpadMotionPathHint = {
    endpointUrl?: string;
    directUrl?: string;
    pageHost?: string;
    routedDesk?: boolean;
};

export const inferAirpadMotionPathClass = (hint: AirpadMotionPathHint): AirpadMotionPathClass => {
    const offHome = isOffHomeFleetNetwork(hint.pageHost);
    const gatewayEndpoint =
        isGatewayHttpsOrigin(hint.endpointUrl) || isGatewayHttpsOrigin(hint.directUrl);
    const routedViaGateway = Boolean(hint.routedDesk) && gatewayEndpoint;
    if (offHome && routedViaGateway) return "wan-wan";
    if (offHome) return "wan";
    return "lan";
};

export const initialMotionIpsForPath = (path: AirpadMotionPathClass): AirpadMotionIpsTier => {
    if (path === "lan") return 120;
    if (path === "wan") return 90;
    return 60;
};

/** @deprecated use {@link initialMotionIpsForPath} */
export const initialMotionHzForPath = initialMotionIpsForPath;

/** Desk apply path: gateway-forwarded input starts lower than direct LAN. */
export const initialApplyIpsForDeskPath = (relayViaGateway: boolean): AirpadMotionIpsTier =>
    relayViaGateway ? 90 : 120;

const readPerfNow = (): number => {
    try {
        const perf = (globalThis as { performance?: { now?: () => number } }).performance;
        if (typeof perf?.now === "function") return perf.now();
    } catch {
        /* ignore */
    }
    return Date.now();
};

const LAG_SAMPLE_CAP = 10;
const LAG_DOWNGRADE_RATIO = 1.45;
const STABLE_UPGRADE_SAMPLES = 48;

const tierIndexForIps = (ips: AirpadMotionIpsTier): number => {
    const idx = AIRPAD_MOTION_IPS_TIERS.indexOf(ips);
    return idx >= 0 ? idx : AIRPAD_MOTION_IPS_TIERS.length - 1;
};

export class AdaptiveMotionRateController {
    private tierIndex = 0;
    private lastSendAt = 0;
    private lagSamples: number[] = [];
    private stableSamples = 0;

    constructor(
        private readonly pathHint: () => AirpadMotionPathHint,
        initialIps?: AirpadMotionIpsTier
    ) {
        if (initialIps !== undefined) {
            this.tierIndex = tierIndexForIps(initialIps);
        } else {
            this.resetTier();
        }
    }

    resetTier(): void {
        const path = inferAirpadMotionPathClass(this.pathHint());
        this.tierIndex = tierIndexForIps(initialMotionIpsForPath(path));
        this.lastSendAt = 0;
        this.lagSamples = [];
        this.stableSamples = 0;
    }

    setTierByIps(ips: AirpadMotionIpsTier): void {
        this.tierIndex = tierIndexForIps(ips);
        this.lagSamples = [];
        this.stableSamples = 0;
    }

    getIps(): AirpadMotionIpsTier {
        return AIRPAD_MOTION_IPS_TIERS[this.tierIndex];
    }

    /** @deprecated use {@link getIps} */
    getHz(): AirpadMotionIpsTier {
        return this.getIps();
    }

    getIntervalMs(): number {
        return motionIntervalMsForIps(this.getIps());
    }

    isWanMotionPath(): boolean {
        return inferAirpadMotionPathClass(this.pathHint()) !== "lan";
    }

    /** Step down when overload is detected (queue depth, arrival flood). */
    forceDowngrade(steps = 1): void {
        const next = Math.min(AIRPAD_MOTION_IPS_TIERS.length - 1, this.tierIndex + Math.max(1, steps));
        if (next !== this.tierIndex) {
            this.tierIndex = next;
            this.lagSamples = [];
            this.stableSamples = 0;
        }
    }

    /** Record a completed motion flush — adapt when cadence lags behind target IPS. */
    onMotionSent(): void {
        const now = readPerfNow();
        const expected = this.getIntervalMs();
        if (this.lastSendAt > 0) {
            const gap = now - this.lastSendAt;
            if (gap > expected * LAG_DOWNGRADE_RATIO) {
                this.lagSamples.push(gap);
                this.stableSamples = 0;
                if (this.lagSamples.length >= LAG_SAMPLE_CAP) {
                    const avg =
                        this.lagSamples.reduce((sum, entry) => sum + entry, 0) / this.lagSamples.length;
                    if (avg > expected * LAG_DOWNGRADE_RATIO && this.tierIndex < AIRPAD_MOTION_IPS_TIERS.length - 1) {
                        this.tierIndex += 1;
                    }
                    this.lagSamples = [];
                }
            } else if (gap <= expected * 1.15) {
                this.lagSamples = [];
                this.stableSamples += 1;
                if (this.stableSamples >= STABLE_UPGRADE_SAMPLES && this.tierIndex > 0) {
                    this.tierIndex -= 1;
                    this.stableSamples = 0;
                }
            }
        }
        this.lastSendAt = now;
    }
}

let sharedController: AdaptiveMotionRateController | null = null;

export const getAirpadMotionRateController = (
    pathHint?: () => AirpadMotionPathHint
): AdaptiveMotionRateController => {
    if (!sharedController) {
        const hint = pathHint ?? (() => ({} as AirpadMotionPathHint));
        sharedController = new AdaptiveMotionRateController(hint);
    }
    return sharedController;
};

export const resetAirpadMotionRateController = (): void => {
    if (sharedController) sharedController.resetTier();
};
