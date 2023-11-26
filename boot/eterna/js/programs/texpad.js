// Example program. Based on texpad. Creates a single black div taking up 100% of the content area
// and does nothing except for the bare minimum in every function.

let texpad_display_markup = new EternaDisplayMarkupContainer(
    "texpad", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "toolbar",
                0, 0, "100%", "22px", {
                    backgroundColor: "#000"
                }, false
            ), []
        ),

        new EternaDisplayMarkupElement(
            EternaDisplayObject.simple_elem(
                "textarea", "textarea",
                0, "calc(20px + 4px)", "calc(100% - 8px)", "calc(100% - 20px - 12px)", {
                    padding: "4px",
                    resize: "none",
                    border: "none",
                    fontFamily: `"Tahoma", "Arial", "Helvetica", "sans-serif"`
                }, false
            ), []
        )
    ]
)

let default_texpad_kernel = new EternaProcessKernel(
    texpad_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        data.ready_to_close = false;

        data.load_path = parameters["file"] ? parameters["file"] : "";
        data.need_to_load = true;

        return {endnow: false}
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return !data.ready_to_close;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        if (data.need_to_load) {
            data.need_to_load = false;
            if (data.load_path) {
                let fcontent = files_ctx.get_file(data.load_path).get_content();

                query_obj.get("textarea").value = fcontent;
            }
        }

        data.clicks = [];

        return data;
    },

    // paint
    function(data, parameters, files_ctx, query_obj) {
        return {title: `texpad: ${data.load_path}`};
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
    }
)