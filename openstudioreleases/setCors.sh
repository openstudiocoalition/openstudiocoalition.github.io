#!/usr/bin/env bash
#set -x #echo on

gcloud storage buckets update gs://osc-downloads.appspot.com --cors-file=cors.json
