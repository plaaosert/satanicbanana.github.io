let clock_display_markup = new EternaDisplayMarkupContainer(
    "Clock", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "clock_area",
                0, 0, "100%", "unset", {
                    backgroundColor: "#ccc",
                    aspectRatio: "1 / 1"
                }, false
            ), [
                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.div(
                        "clock_notch",
                        "calc(50% - 4px)", "calc(50% - 4px)",
                        8, 8, {
                            borderRadius: "4.5px",
                            backgroundColor: "black",
                            zIndex: 1000
                        }
                    )
                ),

                ...new Array(60).fill(0).map((i,v) => {
                    let s = v % 5 == 0 ? 1 : 3;
                    return EternaDisplayMarkupElement.childless(
                        EternaDisplayObject.div(
                            "clock_spoke_"+v,
                            "50%", "50%",
                            9/s, 2, {
                                backgroundColor: v % 5 == 0 ? "black" : "grey",
                                transform: ``,
                                transformOrigin: `0% 0%`
                            }
                        )
                    )
                }),

                /*
                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.div(
                        "clock_millis_hand",
                        "calc(50% - 8px)", "calc(50% - 1px)",
                        "calc(5% + 8px)", 1, {
                            transformOrigin: `8px 1px`,
                            backgroundColor: "black"
                        }
                    )
                ),
                */

                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.div(
                        "clock_second_hand",
                        "calc(50% - 32px)", "calc(50% - 1px)",
                        "calc(35% + 32px)", 2, {
                            transformOrigin: `32px 1px`,
                            backgroundColor: "red"
                        }
                    )
                ),

                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.div(
                        "clock_minute_hand",
                        "calc(50% - 16px)", "calc(50% - 2px)",
                        "calc(30% + 16px)", 4, {
                            transformOrigin: `16px 2px`,
                            backgroundColor: "blue"
                        }
                    )
                ),

                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.div(
                        "clock_hour_hand",
                        "calc(50% - 12px)", "calc(50% - 3px)",
                        "calc(17.5% + 12px)", 6, {
                            transformOrigin: `12px 3px`,
                            backgroundColor: "black"
                        }
                    )
                ),
            ]
        ),


    ]
)

let default_clock_kernel = new EternaProcessKernel(
    clock_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        if (parameters["widget"] == "true") {
            data.window_style = WindowStyle.NOBORDER;
        }

        data.need_to_set_size = true;

        data.ready_to_close = false;
        
        data.need_initial_render = true;
        data.need_render = true;
        data.time = 0;
        data.timeobj = null;

        return {endnow: false}
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return !data.ready_to_close;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        if (data.need_to_set_size) {
            data.set_content_size(new Vector2(
                data.content_size.y,
                data.content_size.y
            ))

            data.need_to_set_size = false;
        }

        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        if (Math.ceil(Date.now() / 1000) != data.time) {
            let date = new Date();
            data.time = Math.ceil(Date.now() / 1000);
            data.timeobj = date;
            data.need_render = true;
        }

        return data;
    },

    // paint
    function(data) {
        let paint_data = {edits: []};

        // window styling rules
        let real_xsiz = data.content_size.x;
        let real_ysiz = data.content_size.y;

        let spoke_dist = 0.9;

        if (data.need_initial_render) {
            // get the window size and use it to set the rotation offset of all 12 spokes
            for (let i=0; i<60; i++) {
                let offset = i % 5 == 0 ? 0 : 0;
                paint_data.edits.push({
                    edit_id: "clock_spoke_"+i,
                    changes: {
                        styles: {
                            left: `calc(${spoke_dist*100}% + ${offset}px)`,
                            top: `50%`,
                            transformOrigin: `${(real_xsiz * (0.5 - spoke_dist))+(4.5 * 0 * spoke_dist)-offset}px 1px`,
                            transform: `rotate(${i*6}deg)`
                        }
                    }
                })
            }

            data.need_initial_render = false;
        }

        if (data.need_render) {
            data.need_render = false;

            let millis_coeff = 0;

            let hrspan = data.timeobj.getHours() + (data.timeobj.getMinutes() / 60.0) + (data.timeobj.getSeconds() / 3600.0) + (data.timeobj.getMilliseconds() * millis_coeff / 3600000.0);
            let mnspan = data.timeobj.getMinutes() + (data.timeobj.getSeconds() / 60.0) + (data.timeobj.getMilliseconds() * millis_coeff / 60000.0);
            let scspan = data.timeobj.getSeconds() + (data.timeobj.getMilliseconds() * millis_coeff / 1000.0);
            let msspan = data.timeobj.getMilliseconds();

            /*
            paint_data.edits.push({
                edit_id: "clock_millis_hand",
                changes: {
                    styles: {
                        transform: `rotate(${msspan * 0.36 - 90}deg)`
                    }
                }
            })
            */

            paint_data.edits.push({
                edit_id: "clock_second_hand",
                changes: {
                    styles: {
                        transform: `rotate(${scspan * 6 - 90}deg)`
                    }
                }
            })

            paint_data.edits.push({
                edit_id: "clock_minute_hand",
                changes: {
                    styles: {
                        transform: `rotate(${mnspan * 6 - 90}deg)`
                    }
                }
            })

            paint_data.edits.push({
                edit_id: "clock_hour_hand",
                changes: {
                    styles: {
                        transform: `rotate(${hrspan * 30 - 90}deg)`
                    }
                }
            })
        }

        return paint_data;
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
        disallow_resize: true
    }
)