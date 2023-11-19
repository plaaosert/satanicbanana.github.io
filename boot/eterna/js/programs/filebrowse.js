let filebrowse_display_markup = new EternaDisplayMarkupContainer(
    "Filebrowse", [
        new EternaDisplayMarkupElement(
            new EternaDisplayObject(
                "addressbar", "div", {
                    left: "0px",
                    top: "0px",
                    width: "100%",
                    height: "16px"
                }
            ), [
                new EternaDisplayMarkupElement(
                    new EternaDisplayObject(
                        "addressbar_back", "div", {
                            left: "0px",
                            top: "0px",
                            height: "16px",
                            width: "16px",
                            backgroundColor: "#f00",
                            border: "1px solid black",
                            backgroundImage: "/SYSTEM/ICONS/debug_16x16.img"
                        },
                        "",
                        false,
                        true, false
                    ), []
                ),

                new EternaDisplayMarkupElement(
                    new EternaDisplayObject(
                        "addressbar_text", "input", {
                            left: "20px",
                            top: "0px",
                            width: "calc(100% - 2px - 20px - 2px - 2px - 20px - 2px - 20px - 2px)",
                            height: "16px",
                            fontSize: "12px",
                            paddingLeft: "4px",
                            paddingRight: "4px",
                            backgroundColor: "#fff",
                            border: "1px solid black"
                        },
                        "/",
                        false,
                        false, true
                    ), []
                ),

                new EternaDisplayMarkupElement(
                    new EternaDisplayObject(
                        "addressbar_refresh", "div", {
                            right: "20px",
                            top: "0px",
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#0f0",
                            border: "1px solid black",
                            backgroundImage: "/SYSTEM/ICONS/debug_16x16.img"
                        },
                        "",
                        false,
                        true, false
                    ), []
                ),

                new EternaDisplayMarkupElement(
                    new EternaDisplayObject(
                        "addressbar_go", "div", {
                            right: "0px",
                            top: "0px",
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#0cf",
                            border: "1px solid black",
                            backgroundImage: "/SYSTEM/ICONS/debug_16x16.img"
                        },
                        "",
                        false,
                        true, false
                    ), []
                ),
            ]
        ),

        new EternaDisplayMarkupElement(
            new EternaDisplayObject(
                "menu_container", "div", {
                    left: "0px",
                    top: "20px",
                    width: "144px",
                    height: "calc(100% - 22px)",
                    background: "linear-gradient(217deg, #ddf, #aac)",
                    border: "1px solid black"
                },
            ), [
                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.label(
                        "num_selected_display", "0 files selected",
                        4, 8, "calc(100% - 8px)", 14, {
                            fontWeight: "bold",
                            textAlign: "center"
                        }, true
                    )
                ),

                new EternaDisplayMarkupElement(
                    EternaDisplayObject.div(
                        "selected_file_options_container",
                        8, 26, "calc(100% - 16px)", 18*6, {
                            "ott-tag-className": "eterna-window-element-disabled",
                            cursortype: MouseDisplayTypes.DENY
                        }, false
                    ), ["Open_with---", "Properties", "Cut", "Copy", "Rename", "Delete"].map((t, i) => {
                        let children = [
                            EternaDisplayMarkupElement.childless(
                                EternaDisplayObject.image(
                                    `${t.toLowerCase()}_button_icon`, "/SYSTEM/ICONS/shortcut_icon.img",
                                    0, 0, 14, 14, {
                                        backgroundSize: "14px"
                                    }, false
                                )
                            ),
            
                            EternaDisplayMarkupElement.childless(
                                EternaDisplayObject.label(
                                    `${t.toLowerCase()}_button`, t.replaceAll("_", " ").replaceAll("-", "."),
                                    20, 0, "calc(100% - 0px)", 14, {
                                        color: t == "Delete" ? "#800" : "blue",
                                        textDecoration: "underline"
                                    }, true, false
                                )
                            ),
                        ]
    
                        return new EternaDisplayMarkupElement(
                            EternaDisplayObject.div(
                                `${t.toLowerCase()}_button_div`,
                                0, (18 * i), "75%", 14, {}, true
                            ), children
                        )
                    })
                ),

                EternaDisplayMarkupElement.childless(
                    EternaDisplayObject.label(
                        "num_selected_display", "Other actions",
                        4, 26 + (18 * 7), "calc(100% - 8px)", 14, {
                            fontWeight: "normal",
                            textAlign: "center"
                        }, true
                    )
                ),

                new EternaDisplayMarkupElement(
                    EternaDisplayObject.div(
                        "other_file_options_container",
                        8, 26 + (18 * 8), "calc(100% - 16px)", 18*3, {
                            // "ott-tag-className": "eterna-window-element-disabled"
                        }, false
                    ), ["Select_all", "New_file", "Paste"].map((t, i) => {
                        let children = [
                            EternaDisplayMarkupElement.childless(
                                EternaDisplayObject.image(
                                    `${t.toLowerCase()}_button_icon`, "/SYSTEM/ICONS/shortcut_icon.img",
                                    0, 0, 14, 14, {
                                        backgroundSize: "14px"
                                    }, true
                                )
                            ),
            
                            EternaDisplayMarkupElement.childless(
                                EternaDisplayObject.label(
                                    `${t.toLowerCase()}_button`, t.replace("_", " "),
                                    20, 0, "calc(100% - 20px)", 14, {
                                        color: t == "Delete" ? "#800" : "blue",
                                        textDecoration: "underline"
                                    }, true, true
                                )
                            ),
                        ]

                        if (t == "Paste") {
                            children.push(
                                EternaDisplayMarkupElement.childless(
                                    EternaDisplayObject.label(
                                        `paste_num_display`, "(0 files)",
                                        0, 0, "calc(100% + 16px)", 14, {
                                            color: "black",
                                            textAlign: "right"
                                        }, true, true
                                    )
                                ),
                            )
                        }
    
                        return new EternaDisplayMarkupElement(
                            EternaDisplayObject.div(
                                `${t.toLowerCase()}_button_div`,
                                0, (18 * i), "75%", 14, {}, true
                            ), children
                        )
                    })
                ),
            ]
        ),

        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "files_list",
                "calc(25% + 4px)", 20,
                "calc(75% - 4px)", "calc(100% - 22px)", {
                    backgroundColor: "#fff",
                    border: "1px solid black"
                }, true
            ), []
        )
    ]
)

let default_filebrowse_kernel = new EternaProcessKernel(
    filebrowse_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        data.forced_location = "";
        data.show_toolbars = true;
        data.autorefresh_cooldown = 0;
        data.need_to_remove_toolbar = false;
        if (parameters["desktopbrowse"] == "true") {
            data.window_style = WindowStyle.NOBORDER;
            data.forced_location = "~/Desktop";
            data.show_toolbars = false;
            data.need_to_remove_toolbar = true;
            data.background = true;
            data.autorefresh_cooldown = 30;
        }

        data.autorefresh_count = data.autorefresh_cooldown;
        data.artificial_loading_delay = parameters["artificial_loading_delay"] ? parameters["artificial_loading_delay"] : 0;

        data.file_icon_size = parameters.file_icon_size ? parameters.file_icon_size : 32;
        data.curpath = parameters.location ? parameters.location : "/";
        data.curloc = files_ctx.get_file(data.curpath);

        data.curpath = data.curloc.get_abs_path();

        data.files = [];
        data.selected_files = new Set();

        data.need_refresh = true;
        data.ready_to_close = false;

        return {};
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return !data.ready_to_close;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        let files_to_select = [];
        let should_deselect = false;
        data.clicks.forEach(click => {
            console.log(click);
            switch (click.from) {
                case "addressbar_refresh":
                    data.need_refresh = true;
                    break;
                
                case "addressbar_go":
                    data.curpath = query_obj.get("addressbar_text").value
                    data.need_refresh = true;
                    break;

                case "addressbar_back":
                    data.curpath = data.curpath.substring(0, data.curpath.slice(0, -1).lastIndexOf("/") + 1);
                    if (!data.curpath) {
                        data.curpath = "/"
                    }
                    data.need_refresh = true;
                    break;

                case "files_list":
                    if (files_to_select.length <= 0) {
                        should_deselect = true;
                        data.need_refresh = true;
                    }
                    break;
                
                case "select_all_button":
                    files_to_select.push(...data.files);
                    break;

                case "new_file_button":
                    should_deselect = true;
                    data.need_refresh = true;
                    let n = 1;
                    while (true) {
                        if (files_ctx.try_add_file(data.curpath, `NewFile${n}.tex`, "")) {
                            break;
                        }

                        n++;
                    }
                    break;
            }

            let m = click.from.match("^file(\\d+)_container$")
            if (m) {
                let file_index = m[1];
                files_to_select = [data.files[file_index]];
            
                should_deselect = !click.evt.ctrlKey;
            }
        })

        if (should_deselect) {
            // console.log("deselecting");
            data.selected_files.clear();
            data.need_repaint = true;
        }

        if (files_to_select.length > 0) {
            files_to_select.forEach(t => data.selected_files.add(t.name));
            data.need_repaint = true;
            // console.log(data.selected_files)
        }

        data.clicks = [];

        data.doubleclicks.forEach(doubleclick => {
            let m = doubleclick.from.match("^file(\\d+)_container$");
            if (m) {
                let target_file = data.files[Number.parseInt(m[1])];

                if (target_file instanceof EternaFSDirectory) {
                    data.curpath = target_file.get_abs_path();
                    data.need_refresh = true;
                } else {
                    // need to open the file with its default association!
                    open_file(files_ctx.userctx, target_file.get_abs_path(), data.curpath);
                }
            }
        });

        data.doubleclicks = [];

        data.keypresses.forEach(keypress => {
            if (keypress.evt.code == "Enter" && keypress.typ == "up") {
                data.curpath = query_obj.get("addressbar_text").value
                data.need_refresh = true;
            }
        })

        data.keypresses = [];

        if (data.forced_location) {
            data.curpath = data.forced_location;
        }

        data.autorefresh_count--;
        if (data.autorefresh_cooldown > 0 && data.autorefresh_count <= 0) {
            data.need_refresh = true;
            data.autorefresh_count = data.autorefresh_cooldown;
        }

        if (data.need_refresh) {
            if (!data.curpath) {
                data.curpath = "/"
            }

            if (!data.curpath.endsWith("/")) {
                data.curpath += "/"
            }

            try {
                data.curloc = files_ctx.get_file(data.curpath);
                data.files = [];
                data.need_refresh = false;
                data.need_repaint = true;

                if (data.show_toolbars) {
                    query_obj.get("addressbar_text").value = data.curpath;
                }

                data.curloc.children.forEach(c => {
                    data.files.push(c);
                })
                data.cant_display = false;
            } catch {
                data.cant_display = true;
                data.need_refresh = false;
                data.need_repaint = true;

                if (data.show_toolbars) {
                    query_obj.get("addressbar_text").value = data.curpath;
                }
            }
        }

        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        if (data.alerts.includes(ProcessAlert.RESIZED)) {
            data.need_repaint = true;
        }

        data.alerts = [];

        if (data.artificial_loading_delay > 0) {
            if (Math.random() < 0.05) {
                data.artificial_loading_delay = Math.min(data.files.length, data.artificial_loading_delay);
                data.artificial_loading_delay--;
                data.need_repaint = true;
                console.log("load delay:", data.artificial_loading_delay)
            }
        }

        return data;
    },

    // paint
    function(data, parameters, files_ctx, query_obj) {
        let paint_data = {removals: []};
        if (data.need_to_remove_toolbar) {
            data.maximize();

            paint_data.removals.push("addressbar");
            paint_data.removals.push("menu_container");
            data.need_to_remove_toolbar = false;
        }

        if (data.need_repaint) {
            // put the shit here
            paint_data.removals.push("files_list");

            let sidebar_size = data.show_toolbars ? 144 : 0;
            let main_size = data.show_toolbars ? (data.content_size.x - sidebar_size - 5) : data.size.x;

            let files_list_xywh = [
                `calc(${sidebar_size}px + 4px)`, 20,
                `${main_size}px`, "calc(100% - 22px)"
            ]

            if (!data.show_toolbars) {
                files_list_xywh = [
                    0, 0, "100%", "100%"
                ]
            }

            let load_files = data.files;
            if (data.artificial_loading_delay) {
                load_files = load_files.slice(0, -data.artificial_loading_delay);
            }

            if (!data.cant_display && data.files.length > 0) {
                paint_data.additions = new EternaDisplayMarkupElement(
                    EternaDisplayObject.div(
                        "files_list",
                        ...files_list_xywh, {
                            backgroundColor: data.show_toolbars ? "#fff" : "",
                            border: data.show_toolbars ? "1px solid black" : "",
                            cursortype: MouseDisplayTypes.NORMAL
                        }, true
                    ), load_files.map((file, index) => {
                        let xsiz = (data.file_icon_size * 2.5) + 8;
                        let ysiz = (data.file_icon_size * 2.5) + 8;

                        // TODO take another look at this code...
                        let num_cols = Math.floor((main_size - 2 - 4 - (xsiz / 4)) / xsiz);
                        let xp = (index % num_cols) * xsiz;
                        let yp = Math.floor(index / num_cols) * ysiz;
                        if (!data.show_toolbars) {
                            let main_size_y = data.size.y;
                            let num_rows = Math.floor((main_size_y - (ysiz / 4)) / (ysiz));
                            xp = Math.floor(index / num_rows) * xsiz;
                            yp = (index % num_rows) * ysiz;
                        }

                        let file_name = file.name;

                        // file might have a custom sprite if it's an xct/lin (first line of content).
                        // if it's a .img it is the sprite
                        let file_sprite = "/SYSTEM/ICONS/debug_foldericon.img";
                        if (file instanceof EternaFSFile) {
                            file_sprite = "/SYSTEM/ICONS/debug_fileicon.img";
                            if (file.name.endsWith(".img")) {
                                file_sprite = file.get_abs_path();
                            } else if (["xct", "lin"].includes(file.get_ext())) {
                                try {
                                    // xcts and lins also don't show their extensions
                                    let content = file.get_content();
                                    let lines = content.split("\n");
                                    file_sprite = lines[0];
                                    file_name = file.get_base();
                                } catch {
                                    // whatever
                                }
                            }
                        }

                        let element_children = [
                            new EternaDisplayMarkupElement(
                                new EternaDisplayObject(`file${index}_img`, "img", {
                                    zIndex: 1,
                                    left: `${data.file_icon_size/2}px`,
                                    width: `${data.file_icon_size}px`,
                                    height: `${data.file_icon_size}px`,
                                    "ott-tag-src": file_sprite,
                                    objectFit: "contain",
                                    // backgroundSize: `cover`,
                                    border: file.get_ext() == "img" ? "1px solid #888" : ""
                                })
                            ),

                            new EternaDisplayMarkupElement(
                                new EternaDisplayObject(`file${index}_txt`, "p", {
                                    zIndex: 1,
                                    top: `${data.file_icon_size + 4}px`,
                                    left: "-10%",
                                    width: `120%`,
                                    height: `16px`,
                                    textAlign: "center",
                                    wordBreak: "break-all",
                                    whiteSpace: "normal",
                                    color: !data.show_toolbars ? "white" : "black"
                                }, file_name)
                            ),

                            new EternaDisplayMarkupElement(
                                EternaDisplayObject.div(
                                    `file${index}_highlight`, -8, -12, data.file_icon_size + 48, data.file_icon_size + 48, {
                                        backgroundColor: data.selected_files.has(file.name) ? "#88f8" : "",
                                        border: data.selected_files.has(file.name) ? "1px solid #008" : ""
                                    }, false
                                )
                            )
                        ]

                        if (file.get_ext() == "lin") {
                            // LINs need a little shortcut icon
                            element_children.push(new EternaDisplayMarkupElement(
                                EternaDisplayObject.image(
                                    `file${index}_shortcut_img`,
                                    "/SYSTEM/ICONS/shortcut_icon.img", 
                                    (data.file_icon_size/2) + data.file_icon_size - 8,
                                    data.file_icon_size - 8,
                                    8, 8, {border: "1px solid black", zIndex: 2}, false
                                )
                            ))
                        }

                        return new EternaDisplayMarkupElement(
                            new EternaDisplayObject(`file${index}_container`, "div", {
                                left: `${xp + (xsiz / 4)}px`,
                                top: `${yp + (ysiz / 4)}px`,
                                width: `${data.file_icon_size*2}px`,
                                height: `${ysiz - 18}px`,
                            }, "", false, true, false), element_children
                        )
                    })
                ).to_initial_paint();
            } else if (data.files.length <= 0 && data.show_toolbars) {
                paint_data.additions = new EternaDisplayMarkupElement(
                    new EternaDisplayObject("files_list", "div", {
                        left: `calc(${sidebar_size}px + 4px)`,
                        top: "20px",
                        width: `${main_size}px`,
                        height: "calc(100% - 22px)",
                        border: "1px solid black",
                        backgroundColor: "#fff"
                    }), [
                        new EternaDisplayMarkupElement(
                            new EternaDisplayObject(`nofiles_warning`, "p", {
                                left: `0px`,
                                top: `16px`,
                                width: `100%`,
                                height: `100%`,
                                color: "#999",
                                textAlign: "center",
                                wordBreak: "break-all",
                                whiteSpace: "normal"
                            }, "This directory is empty.", false, true, false)
                        )
                    ]
                ).to_initial_paint();
            } else if (data.show_toolbars) {
                paint_data.additions = new EternaDisplayMarkupElement(
                    new EternaDisplayObject("files_list", "div", {
                        left: `calc(${sidebar_size}px + 4px)`,
                        top: "20px",
                        width: `${main_size}px`,
                        height: "calc(100% - 22px)",
                        border: "1px solid black",
                        backgroundColor: "#fff"
                    }), [
                        new EternaDisplayMarkupElement(
                            new EternaDisplayObject(`nofiles_warning`, "p", {
                                left: `0px`,
                                top: `50%`,
                                width: `100%`,
                                height: `100%`,
                                textAlign: "center",
                                wordBreak: "break-all",
                                whiteSpace: "normal"
                            }, "You cannot access the contents of this directory, or it doesn't exist.", false, true, false)
                        )
                    ]
                ).to_initial_paint();
            }

            data.need_repaint = false;
        }

        return paint_data;
    },

    {
        disallow_resize: false,
        disallow_move: false,
    }
)
