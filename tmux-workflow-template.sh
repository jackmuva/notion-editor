#!/bin/sh

# Set Session Name
SESSION="QOL-SESSION"
SESSIONEXISTS=$(tmux list-sessions | grep $SESSION)

# Only create tmux session if it doesn't already exist
if [ "$SESSIONEXISTS" = "" ]
then
    # Start New Session with our name
    tmux new-session -d -s $SESSION

    # Name first Pane and start zsh
    tmux rename-window -t 0 'nvim-win'
    tmux send-keys -t 'nvim-win' 'nvim' C-m

    tmux new-window -t $SESSION:1 -n 'next-server'
    tmux send-keys -t 'next-server' 'npm run dev' C-m

    tmux new-window -t $SESSION:2 -n 'opencode'
    tmux send-keys -t 'opencode' 'opencode' C-m
fi

# Attach Session, on the Main window
tmux attach-session -t $SESSION:0
