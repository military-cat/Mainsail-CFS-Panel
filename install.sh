#!/bin/sh
# SPDX-License-Identifier: GPL-3.0-only
set -eu
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if ! command -v python3 >/dev/null 2>&1; then
    printf '%s\n' 'Python 3 is required / Python 3가 필요합니다 / Python 3 が必要です / 需要 Python 3 / Se requiere Python 3' >&2
    exit 1
fi
exec python3 "$script_dir/install.py" "$@"
