export ZSH="$HOME/.oh-my-zsh"

ZSH_THEME="corehalla"
ZSH_CUSTOM=$HOME/.oh-my-zsh/custom

plugins=(git)

cd /home/corehalla/workspace

# Source
source $ZSH/oh-my-zsh.sh

# pnpm
export PNPM_HOME="/home/corehalla/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"
# pnpm end