# Run the regular bashrc files
source /etc/bash.bashrc
source ~/.bashrc

# Set up piping to redsnail
export PROMPT_COMMAND='echo -n PWD:$PWDHIST1:`history 1`  > $REDSNAIL_PIPE'