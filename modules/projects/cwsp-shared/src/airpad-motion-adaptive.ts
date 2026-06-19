/**
 * Adaptive AirPad motion send rate — downgrade on WAN/WAN-WAN when 120/90 Hz cannot keep pace.
 */
import { isGatewayHttpsOrigin, isOffHomeFleetNetwork } from "./airpad-cwsp-client-parity.ts";

export const AIRPAD_MOTION_HZ_TIERS = [120, 90, 60] as const;

export type AirpadMotionHzTier = (typeof AIRPAD_MOTION_HZ_TIERS)[number];

export const motionIntervalMsForHz = (hz: number): number =>
    Math.max(1, Math.round(1000 / Math.max(1, hz)));

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

export const initialMotionHzForPath = (path: AirpadMotionPathClass): AirpadMotionHzTier => {
    if (path === "lan") return 120;
    if (path === "wan") return 90;
    return 60;
};

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
const STABLE_UPGRADE_SAMPLES = 72;

export class AdaptiveMotionRateController {
    private tierIndex = 0;
    private lastSendAt = 0;
    private lagSamples: number[] = [];
    private stableSamples = 0;

    constructor(private readonly pathHint: () => AirpadMotionPathHint) {
        this.resetTier();
    }

    resetTier(): void {
        const path = inferAirpadMotionPathClass(this.pathHint());
        const initialHz = initialMotionHzForPath(path);
        const idx = AIRPAD_MOTION_HZ_TIERS.indexOf(initialHz);
        this.tierIndex = idx >= 0 ? idx : AIRPAD_MOTION_HZ_TIERS.length - 1;
        this.lastSendAt = 0;
        this.lagSamples = [];
        this.stableSamples = 0;
    }

    getHz(): AirpadMotionHzTier {
        return AIRPAD_MOTION_HZ_TIERS[this.tierIndex];
    }

    getIntervalMs(): number {
        return motionIntervalMsForHz(this.getHz());
    }

    isWanMotionPath(): boolean {
        return inferAirpadMotionPathClass(this.pathHint()) !== "lan";
    }

    /** Record a completed motion flush — adapt tier when send cadence lags behind target Hz. */
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
                    if (avg > expected * LAG_DOWNGRADE_RATIO && this.tierIndex < AIRPAD_MOTION_HZ_TIERS.length - 1) {
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
