#!/usr/bin/env bash
set -euo pipefail

# Entry point (по умолчанию текущий каталог)
ROOT="${1:-.}"

# Проверка, что ROOT существует
if [[ ! -e "$ROOT" ]]; then
  echo "Ошибка: путь '$ROOT' не существует" >&2
  exit 1
fi

# Нужен realpath или аналог. Проверим.
if ! command -v realpath >/dev/null 2>&1; then
  echo "Ошибка: требуется 'realpath' в PATH" >&2
  exit 1
fi

# Эквивалент dirname+basename через shell-функции
dir_of() {
  local path="$1"
  dirname -- "$path"
}

name_of() {
  local path="$1"
  basename -- "$path"
}

# Обрабатываем все симлинки рекурсивно
find "$ROOT" -type l | while IFS= read -r link; do
  # Текущая цель симлинка (как записано)
  target=$(readlink -- "$link") || continue

  # Интересуют только абсолютные ссылки
  case "$target" in
    /*) ;;           # абсолютный путь — работаем
    *)  continue ;;  # относительный — пропускаем
  esac

  link_dir=$(dir_of "$link")

  # Получаем реальный путь до цели.
  # Если цель не существует, всё равно можно пересчитать относительный путь,
  # но realpath -m "склеит" путь без проверки существования.
  abs_target=$(realpath -m -- "$target")

  # Считаем относительный путь от каталога ссылки до цели.
  rel_target=$(realpath --relative-to="$link_dir" -- "$abs_target")

  # Если по какой-то причине не получилось — пропускаем
  if [[ -z "$rel_target" ]]; then
    echo "Предупреждение: не удалось пересчитать ссылку '$link' -> '$target'" >&2
    continue
  fi

  echo "Переписываю: $link"
  echo "  было: $target"
  echo "  стало: $rel_target"

  # Удаляем старую ссылку и создаём новую с относительным путём
  rm -- "$link"
  ln -s -- "$rel_target" "$link"
done
