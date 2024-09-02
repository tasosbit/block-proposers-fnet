#!/bin/bash

if [ ! -f "$1" ]; then
  echo Error: provide PID file
fi

kill "$(cat $1)"
