#!/bin/bash

yarn react-native generate-bootsplash assets/icon_with_shadow.png \
  --background-color=27272A \
  --logo-width=150 \
  --assets-path=assets \
  --flavor=main

yarn react-native generate-bootsplash assets/icon_with_shadow_debug.png \
  --background-color=27272A \
  --logo-width=150 \
  --assets-path=assets \
  --flavor=debug
