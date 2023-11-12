// Example program. Based on shell. Creates a single black div taking up 100% of the content area
// and does nothing except for the bare minimum in every function.

let shell_display_markup = new EternaDisplayMarkupContainer(
    "Shell", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "command_area",
                0, 0, "100%", "100%", {
                    backgroundColor: "#000"
                }, false
            ), []
        )
    ]
)

let default_shell_kernel = new EternaProcessKernel(
    shell_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        return {endnow: false}
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return true;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        return data;
    },

    // paint
    function(data) {
        return {};
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
    }
)