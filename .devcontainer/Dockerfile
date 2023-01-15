FROM node:18

ARG USERNAME=corehalla
ARG USER_UID=1001
ARG USER_GID=$USER_UID

# Create the user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    #
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN apt-get update
RUN apt-get install -y \
    curl \
    zsh

# set home
ENV HOME /home/$USERNAME
ENV WORKSPACE_PATH $HOME/workspace

ENV SHELL /bin/zsh

# Install Oh-My-Zsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

USER $USERNAME

ENV NODE_ENV development
