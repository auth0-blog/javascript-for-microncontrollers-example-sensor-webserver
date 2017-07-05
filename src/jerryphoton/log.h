#ifndef JERRYPHOTON_CPP_STATIC_GUARD
#error "This file is only meant to be included by jerryphoton.cpp"
#endif

#include "application.h"
#include "jerryscript.h"

#include "utils.h"

#include <vector>

namespace jerryphoton {

static void
photon_log(LogLevel level, const jerry_value_t arg) {
    const std::vector<char> msg(jerry_value_to_cstring(arg));
    Log.log(level, "%s", msg.data());
}

static jerry_value_t
photon_log_trace(const jerry_value_t func,
                 const jerry_value_t thiz,
                 const jerry_value_t *args,
                 const jerry_length_t argscount) {
    const jerry_value_t undefined = jerry_create_undefined();
    if(argscount != 1) {
        Log.error("'photon.log' takes a single argument.");
        return undefined;
    }

    photon_log(LOG_LEVEL_TRACE, *args);

    return undefined;
}

static jerry_value_t
photon_log_info(const jerry_value_t func,
                const jerry_value_t thiz,
                const jerry_value_t *args,
                const jerry_length_t argscount) {
    const jerry_value_t undefined = jerry_create_undefined();
    if(argscount != 1) {
        Log.error("'photon.log' takes a single argument.");
        return undefined;
    }

    photon_log(LOG_LEVEL_INFO, *args);

    return undefined;
}

static jerry_value_t
photon_log_warn(const jerry_value_t func,
                const jerry_value_t thiz,
                const jerry_value_t *args,
                const jerry_length_t argscount) {
    const jerry_value_t undefined = jerry_create_undefined();
    if(argscount != 1) {
        Log.error("'photon.log' takes a single argument.");
        return undefined;
    }

    photon_log(LOG_LEVEL_WARN, *args);

    return undefined;
}

static jerry_value_t
photon_log_error(const jerry_value_t func,
                 const jerry_value_t thiz,
                 const jerry_value_t *args,
                 const jerry_length_t argscount) {
    const jerry_value_t undefined = jerry_create_undefined();
    if(argscount != 1) {
        Log.error("'photon.log' takes a single argument.");
        return undefined;
    }

    photon_log(LOG_LEVEL_ERROR, *args);

    return undefined;
}

} //namespace jerryphoton
