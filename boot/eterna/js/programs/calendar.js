const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Sun - Sat is 0 - 6.
// Would be nice to make this configurable for the user.
const first_day_of_week = 1;

function get_days_in_month(month, year) {
    // using day=0 wraps it back around to the last day of the previous month
    return new Date(year, month + 1, 0).getDate()
}

let calendar_display_markup = new EternaDisplayMarkupContainer(
    'Calendar', [
        new EternaDisplayMarkupElement(
            EternaDisplayObject.div(
                'calendar_window',
                0, 0, '100%', '100%', {
                    position: 'relative',
                }, false
            ), [
                new EternaDisplayMarkupElement(
                    EternaDisplayObject.div(
                        'calendar_menu',
                        0, 0, '100%', '', {
                            position: 'relative',
                            display: 'flex',
                            'justify-content': 'space-between',
                            'border-bottom': '1px solid black',
                            'padding-bottom': '2px'
                        }, false
                    ), [
                        
                        new EternaDisplayMarkupElement(
                            EternaDisplayObject.div(
                                'prev_div',
                                0, 0, '', '', {
                                    position: 'relative'
                                }, false
                            ), [
                                EternaDisplayMarkupElement.childless(
                                    EternaDisplayObject.image(
                                        `month_prev_button`, '/SYSTEM/ICONS/arrow_icon.img',
                                        0, 0, 32, 32, {
                                            position: 'relative',
                                            transform: 'scale(-1, 1)'
                                        }, true
                                    )
                                ),
                            ]
                        ),
                        new EternaDisplayMarkupElement(
                            EternaDisplayObject.div(
                                'month_name',
                                0, 0, '', '', {
                                    position: 'relative',
                                    'font-size': '20px',
                                    'line-height': '32px'
                                }, false, 'mid'
                            ), [
                                
                            ]
                        ),
                        new EternaDisplayMarkupElement(
                            EternaDisplayObject.div(
                                'next_div',
                                0, 0, '', '', {
                                    position: 'relative'
                                }, false
                            ), [
                                EternaDisplayMarkupElement.childless(
                                    EternaDisplayObject.image(
                                        `month_next_button`, '/SYSTEM/ICONS/arrow_icon.img',
                                        0, 0, 32, 32, {
                                            position: 'relative'
                                        }, true
                                    )
                                ),
                            ]
                        ),
                    ]
                ),
                new EternaDisplayMarkupElement(
                    EternaDisplayObject.div(
                        'calendar_grid',
                        0, 32, '100%', '100%', {
                            display: 'grid',
                            gridTemplateRows: 'repeat(7, 1fr)',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                        }, false
                    ), [
                        
                    ]
                )
            ]
        )
    ]
)

function dateElement(day_number, unique_identifier, highlight=false) {
    return new EternaDisplayMarkupElement(
        EternaDisplayObject.div(
            'date_' + unique_identifier,
            0, 0, '100%', '100%', {
                position: 'relative',
                display: 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'line-height': '35px'
            }, false
        ), [
            EternaDisplayMarkupElement.childless(
                EternaDisplayObject.div(
                    'date_text_' + unique_identifier,
                    0, 0, '35px', '35px', {
                        fontSize: '20px',
                        textAlign: 'center',
                        backgroundColor: highlight ? '#fff' : 'transparent',
                        color: '#000',
                        'border-radius': '100%',
                        'border': highlight ? '' : '1px solid #bbb',
                        position: 'relative'
                    }, false, day_number.toString()
                )
            )
        ]
    )
}


function dateDowLabel(label_text) {
    return new EternaDisplayMarkupElement(
        EternaDisplayObject.div(
            'date_label_' + label_text,
            0, 0, '100%', '100%', {
                position: 'relative',
                display: 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'font-size': '20px',
                'font-weight': 'bold',
            }, false, label_text
        ), [
           
        ]
    )
}

let default_calendar_kernel = new EternaProcessKernel(
    calendar_display_markup,

    // spawn
    function(data, parameters, files_ctx) {
        data.min_size = new Vector2(350, 350);

        const current_date = new Date();
        data.month = current_date.getMonth();
        data.year = current_date.getFullYear();
        data.need_repaint = true;
        return { endnow: false }
    },

    // heartbeat
    function(data, parameters, files_ctx, query_obj) {
        return !data.ready_to_close;
    },

    // process
    function(data, parameters, files_ctx, query_obj) {
        // handle month/year navigation buttons
        data.clicks.forEach(click => {
            switch (click.from) {
                case 'month_prev_button':
                    data.month -= 1;
                    if (data.month == -1) {
                        data.month = 11;
                        data.year -= 1;
                    }
                    data.need_repaint = true;
                    break;
                case 'month_next_button':
                    data.month += 1;
                    if (data.month == 12) {
                        data.month = 0;
                        data.year += 1;
                    }
                    data.need_repaint = true;
                    break;
                default:
                    break;
            }
        });

        data.clicks = [];

        if (data.alerts.includes(ProcessAlert.CLOSE)) {
            data.ready_to_close = true;
        }

        return data;
    },

    // paint
    function(data) {
        let paint_data = {edits: [], removals: []};
        
        if (data.need_repaint) {
            data.need_repaint = false;
            const current_date = new Date();
            const year = data.year;
            const month = data.month;
            const month_name = months[month];
            const days_in_month = get_days_in_month(month, year);
            const first_day_of_month = new Date(year, month, 1);
            const start_day_of_week = first_day_of_month.getDay();
            const padding_days = (7 + start_day_of_week - first_day_of_week) % 7;
            const day_elements = [];

            // shift the weekdays to the desired starting day
            const day_name_row = days.slice(first_day_of_week).concat(days.slice(0, first_day_of_week))

            // add names of weekdays
            day_name_row.forEach(dow => {
                day_elements.push(dateDowLabel(dow.substring(0, 3)));
            });
            
            // align to correct weekday
            for (let i = 0; i < padding_days; i++) {
                day_elements.push(dateElement('', day_elements.length));
            }

            // add actual day numbers
            for (let i = 1; i <= days_in_month; i++) {
                day_elements.push(dateElement(i, day_elements.length, i == current_date.getDate() 
                                                                    && month == current_date.getMonth()
                                                                    && year == current_date.getFullYear()));
            }

            // ensure grid is always 7 rows in total
            while (day_elements.length < 7 * 7) {
                day_elements.push(dateElement('', day_elements.length))
            }
            
            paint_data.removals.push('date_grid')

            paint_data.edits.push({
                edit_id: 'month_name',
                changes: { content: `${month_name} ${year}` }
            })

            paint_data.additions = new EternaDisplayMarkupElement(
                EternaDisplayObject.div(
                    'date_grid',
                    0, 32, '100%', 'calc(100% - 32px)', {
                        display: 'grid',
                        gridTemplateRows: 'repeat(7, 1fr)',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                    }, false
                ), day_elements
            ).to_initial_paint();
        }
        
        return paint_data;
    },

    {
        // prefs (disallow_resize, disallow_move, always_on_top, ...)
    }
)
