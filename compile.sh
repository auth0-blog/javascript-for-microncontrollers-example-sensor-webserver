#!/bin/sh

docker run -t -i -v $(pwd)/src:/build/jerryscript/targets/particle/source -v $(pwd)/Makefile.particle:/build/jerryscript/targets/particle/Makefile.particle -v $(pwd)/custom.profile:/build/jerryscript/jerry-core/profiles/custom.profile -v $(pwd)/dist:/tmp/dist --rm sebadoom/jerryphoton:sensor_hub /bin/bash -c 'cd /build/jerryscript && make -f ./targets/particle/Makefile.particle && cp ./build/particle/jerry_main.bin /tmp/dist/firmware.bin'

