local LC_ALL="" LC_CTYPE="en_US.UTF-8"

black=%F{0}
red=%F{1}
green=%F{2}
yellow=%F{3}
blue=%F{4}
magenta=%F{5}
cyan=%F{6}
gray=%F{7}

bblack=%F{8}
bred=%F{9}
bgreen=%F{10}
byellow=%F{11}
bblue=%F{12}
bmagenta=%F{13}
bcyan=%F{14}
bgray=%F{15}

reset=%f

prompt_user() {
  echo -n $yellow%n$reset
}

prompt_dir() {
  echo -n $reset:%~
}

prompt_git() {
  setopt prompt_subst
  autoload -Uz vcs_info

  zstyle ':vcs_info:*' enable git
  zstyle ':vcs_info:git:*' check-for-changes true
  zstyle ':vcs_info:git:*' stagedstr "$green➕"
  zstyle ':vcs_info:git:*' unstagedstr "$yellow●"
  zstyle ':vcs_info:*' formats "$black::$reset%b%u%c"
  vcs_info

  echo -n ${vcs_info_msg_0_}$reset
}

build_prompt() {
  RETVAL=$?
  prompt_user
  prompt_dir
  prompt_git
  echo -n $reset›
}

export LS_COLORS='di=1;4;34';

export PROMPT='$(build_prompt)'