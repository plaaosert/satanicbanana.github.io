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

                ...[0,1,2,3,4,5,6,7,8,9,10,11].map(v => {
                    return EternaDisplayMarkupElement.childless(
                        EternaDisplayObject.div(
                            "clock_spoke_"+v,
                            `50%`, `50%`,
                            9, 2, {
                                backgroundColor: "black",
                                transform: `rotate(${30*v}deg)`,
                                transformOrigin: `0% 0%`
                            }
                        )
                    )
                }),

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
        data.size.x = data.size.y;
        data.size.y = data.size.y + 24;

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
        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        if (Math.round(Date.now()) != data.time) {
            let date = new Date();
            data.time = Math.round(Date.now());
            data.timeobj = date;
            data.need_render = true;
        }

        return data;
    },

    // paint
    function(data) {
        let paint_data = {edits: []};

        // window styling rules
        let real_xsiz = (data.size.x-5);
        let real_ysiz = (data.size.y-33);

        if (data.need_initial_render) {
            // get the window size and use it to set the rotation offset of all 12 spokes
            for (let i=0; i<12; i++) {
                paint_data.edits.push({
                    edit_id: "clock_spoke_"+i,
                    changes: {
                        styles: {
                            left: `32px`,
                            top: `50%`,
                            transformOrigin: `${(real_xsiz / 2) - 32}px 1px`,
                            transform: `rotate(${i*30}deg)`
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