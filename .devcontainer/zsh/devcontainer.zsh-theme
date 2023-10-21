local LC_ALL="" LC_CTYPE="en_US.UTF-8"
autoload -U colors && colors

prompt_git() {
  setopt prompt_subst
  autoload -Uz vcs_info

  zstyle ':vcs_info:*' enable git
  zstyle ':vcs_info:git:*' check-for-changes true
  zstyle ':vcs_info:git:*' stagedstr "%{$fg_bold[green]%}!%{$reset_color%}"
  zstyle ':vcs_info:git:*' unstagedstr "%{$fg_bold[yellow]%}?%{$reset_color%}"
  zstyle ':vcs_info:*' formats " › %b%c%u"
  zstyle ':vcs_info:*' actionformats " › %b%c%u %{$fg_bold[red]%}[%a]%{$reset_color%}"
  vcs_info

  echo -n ${vcs_info_msg_0_}$reset
}

build_prompt() {
  echo -n "%{$fg[gray]%}corehalla%{$reset_color%}%{$fg[blue]%}%~%{$reset_color%}"
  prompt_git
  echo
  echo "🚀 › "
}

export PROMPT='$(build_prompt)'
