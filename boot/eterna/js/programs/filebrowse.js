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
                        8, 26, "calc(100% - 16px)", 18*4, {
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
                                    }, true
                                )
                            ),
            
                            EternaDisplayMarkupElement.childless(
                                EternaDisplayObject.label(
                                    `${t.toLowerCase()}_button`, t.replaceAll("_", " ").replaceAll("-", "."),
                                    20, 0, "calc(100% - 0px)", 14, {
                                        color: t == "Delete" ? "#800" : "blue",
                                        textDecoration: "underline"
                                    }, true, true
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
                        8, 26 + (18 * 8), "calc(100% - 16px)", 18*4, {
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
            new EternaDisplayObject(
                "files_list", "div", {
                    left: "calc(25% + 4px)",
                    top: "20px",
                    width: "calc(75% - 4px)",
                    height: "calc(100% - 22px)",
                    backgroundColor: "#fff",
                    border: "1px solid black"
                },
            ), []
        )
    ]
)

let default_filebrowse_kernel = new EternaProcessKernel(
    filebrowse_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        data.file_icon_size = parameters.file_icon_size ? parameters.file_icon_size : 32;
        data.curpath = parameters.location ? parameters.location : "/";
        data.curloc = files_ctx.get_file(data.curpath);

        data.curpath = data.curloc.get_abs_path();

        data.files = [];
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
        data.clicks.forEach(click => {
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
            }
        })

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

                query_obj.get("addressbar_text").value = data.curpath;

                data.curloc.children.forEach(c => {
                    data.files.push(c);
                })
                data.cant_display = false;
            } catch {
                data.cant_display = true;
                data.need_refresh = false;
                data.need_repaint = true;

                query_obj.get("addressbar_text").value = data.curpath;
            }
        }

        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        return data;
    },

    // paint
    function(data, parameters, files_ctx, query_obj) {
        let paint_data = {};
        if (data.need_repaint) {
            // put the shit here
            paint_data.removals = ["files_list"]

            let sidebar_size = 144;
            let main_size = data.content_size.x - sidebar_size;

            if (!data.cant_display && data.files.length > 0) {
                paint_data.additions = new EternaDisplayMarkupElement(
                    new EternaDisplayObject("files_list", "div", {
                        left: `calc(${sidebar_size}px + 4px)`,
                        top: "20px",
                        width: `${main_size}px`,
                        height: "calc(100% - 22px)",
                        border: "1px solid black",
                        backgroundColor: "#fff"
                    }), data.files.map((file, index) => {
                        let xsiz = (data.file_icon_size * 2.5) + 8;
                        let ysiz = data.file_icon_size + 48 + 2;

                        let num_cols = Math.floor((main_size - 2 - 4 - (xsiz / 4)) / xsiz);
                        let xp = (index % num_cols) * xsiz;
                        let yp = Math.floor(index / num_cols) * ysiz;

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
                                    left: `${data.file_icon_size/2}px`,
                                    width: `${data.file_icon_size}px`,
                                    height: `${data.file_icon_size}px`,
                                    "ott-tag-src": file_sprite,
                                    objectFit: "contain",
                                    backgroundColor: "#fff",
                                    // backgroundSize: `cover`,
                                    border: file.get_ext() == "img" ? "1px solid #888" : ""
                                })
                            ),

                            new EternaDisplayMarkupElement(
                                new EternaDisplayObject(`file${index}_txt`, "p", {
                                    top: `${data.file_icon_size + 4}px`,
                                    left: "-10%",
                                    width: `120%`,
                                    height: `16px`,
                                    textAlign: "center",
                                    wordBreak: "break-all",
                                    whiteSpace: "normal"
                                }, file_name)
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
                                    8, 8, {border: "1px solid black"}, false
                                )
                            ))
                        }

                        return new EternaDisplayMarkupElement(
                            new EternaDisplayObject(`file${index}_container`, "div", {
                                left: `${xp + (xsiz / 4)}px`,
                                top: `${yp + (ysiz / 4)}px`,
                                width: `${data.file_icon_size*2}px`,
                                height: `${ysiz}px`,
                            }, "", false, true, false), element_children
                        )
                    })
                ).to_initial_paint();
            } else if (data.files.length <= 0) {
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
            } else {
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
