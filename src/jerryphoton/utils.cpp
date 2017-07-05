#include "utils.h"

#include "application.h"

#include <vector>

namespace jerryphoton {

std::vector<char>
jerry_value_to_cstring(const jerry_value_t value) {
    const jerry_value_t str = jerry_value_is_string(value) ? 
        value : jerry_value_to_string(value);
    
    const size_t size = jerry_get_string_size(str);
    std::vector<char> buf(size + 1);
    buf[size] = '\0';

    jerry_string_to_utf8_char_buffer(str, 
        reinterpret_cast<jerry_char_t*>(buf.data()), 
        size);

    if(!jerry_value_is_string(value)) {
        jerry_release_value(str);
    }

    return buf;
}

jerry_value_t create_string(const char *str) {
    return jerry_create_string(reinterpret_cast<const jerry_char_t*>(str));
}

void log_jerry_error(jerry_value_t error) {
    const std::vector<char> buf(jerry_value_to_cstring(error));
    
    Log.error("Error evaluating the script, code %s", buf.data());
}

}
