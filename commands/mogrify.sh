#!/bin/bash

# resize all popup images to correct size 
mogrify -path ../images/popup -resize 360 ../images/popup/*.jpg
