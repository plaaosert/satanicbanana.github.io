let login_display_markup = new EternaDisplayMarkupContainer(
    "Enter Credentials", [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.image(
                "eterna_icon", "SYSTEM/ICONS/eterna_icon_large.img",
                16, 16, 64, 64, {}, false
            ), []
        ),

        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                "signin_container",
                16+64+16, 16,
                "calc(100% - 16px - 64px - 16px)", 64,
                {}, false
            ), [
                new EternaDisplayMarkupElement(
                    EternaDisplayObject.label(
                        "signin_label", "Please enter your credentials to access this system.",
                        1, 0, "100%", 64, {}, true, false
                    ), []
                ),

                new EternaDisplayMarkupElement(
                    EternaDisplayObject.simple_elem(
                        "signin_username", "input",
                        0, 20, "calc(100% - 64px)", 16, {
                            "ott-tag-type": "text",
                            "ott-tag-placeholder": "Username",
                            paddingLeft: "2px",
                            paddingRight: "2px",
                        }, false
                    ), []
                ),

                new EternaDisplayMarkupElement(
                    EternaDisplayObject.simple_elem(
                        "signin_password", "input",
                        0, 44, "calc(100% - 64px)", 16, {
                            "ott-tag-type": "password",
                            "ott-tag-placeholder": "Password",
                            paddingLeft: "2px",
                            paddingRight: "2px",
                        }, false
                    ), []
                )
            ]
        ),

        new EternaDisplayMarkupElement(
            EternaDisplayObject.simple_elem(
                "signin_button", "button",
                "calc(((100% - 16px - 64px - 16px) / 2) - 12.5%)", 
                96, "30%", 20, {}, true, "Log in"
            ), []
        ),
    ]
)

let default_login_kernel = new EternaProcessKernel(
    login_display_markup,
    // spawn
    function(data, parameters, files_ctx) {
        data.window_style = WindowStyle.DEFAULT_NOCONTROLBUTTONS;

        data.set_content_size(new Vector2(400, 192));

        data.position = windowsiz.div(2).sub(data.size.div(2));

        data.login_delay = 60;
        data.login_success = false;
        data.done_params_check = false;

        data.lock_user = parameters["lock_user"];
        data.lock_pass = parameters["lock_pass"];

        return {};
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return data.login_delay > 0;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        data.clicks.forEach(click => {
            console.log(click);
            switch (click.from) {
                case "signin_button":
                    // TODO check passwords here; for now, just set the username to the given user
                    if (!data.login_success) {
                        data.login_success = true;
                        cur_user_ctx = {user: {name: query_obj.get("signin_username").value}}
                        data.done_params_check = false;
                    }
                    break;
            }
        });

        data.clicks = [];
        data.doubleclicks = [];
        data.keypresses = [];

        if (!data.done_params_check) {
            if (parameters["lock_user"]) {
                query_obj.get("signin_username").value = parameters["lock_user"]
            }

            if (parameters["lock_pass"]) {
                query_obj.get("signin_password").value = parameters["lock_pass"]
            }
        }

        if (data.login_success) {
            data.login_delay--;
        }

        return data;
    },

    // paint
    function(data) {
        let paint_data = {};
        if (!data.done_params_check) {
            let should_disable_user = data.lock_user ? true : false;
            let should_disable_pass = data.lock_pass ? true : false;

            paint_data.edits = [];

            paint_data.edits.push({
                edit_id: "signin_username", changes: {
                    disabled: should_disable_user || data.login_success
                }
            });

            paint_data.edits.push({
                edit_id: "signin_password", changes: {
                    disabled: should_disable_pass || data.login_success
                }
            });

            paint_data.edits.push({
                edit_id: "signin_button", changes: {
                    disabled: data.login_success
                }
            });

            data.done_params_check = true;
        }

        return paint_data;
    },

    {
        disallow_resize: true,
        disallow_move: true,
        always_on_top: true
    }
)