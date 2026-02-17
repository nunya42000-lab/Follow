// ==========================================
// mod-dictionary.js - The Data Source
// ==========================================

window.geminiMods = window.geminiMods || {};

window.geminiMods.gestureGroups = {
    taps_1f: { label: "1 Finger Taps", defaultOn: true, gestures: ['tap', 'double_tap', 'triple_tap', 'long_tap'] },
    
    taps_spatial_double: { label: "Spatial Double Taps", defaultOn: true, gestures: [
        'Double_tap_spatial_nw', 'Double_tap_spatial_up', 'Double_tap_spatial_ne',
        'Double_tap_spatial_left', 'Double_tap', 'Double_tap_spatial_right',
        'Double_tap_spatial_sw', 'Double_tap_spatial_down', 'Double_tap_spatial_se'
    ]},
    
    taps_spatial_triple: { label: "Spatial Triple Taps", defaultOn: false, gestures: [
        'triple_tap_spatial_line_any', 'triple_tap_spatial_line_up', 'triple_tap_spatial_line_down', 
        'triple_tap._spatial_line_left', 'triple_tap._spatial_line_right', 'triple_tap_spatial_corner_ne', 
        'triple_tap_spatial_corner_nw', 'triple_tap_spatial_corner_se', 'triple_tap_spatial_corner_sw', 
        'triple_tap_spatial_corner_en', 'triple_tap_spatial_corner_wn', 'triple_tap_spatial_corner_es', 
        'triple_tap_spatial_corner_ws', 'triple_tap_spatial_boomerang_any', 'triple_tap_spatial_boomerang_up', 
        'triple_tap_spatial_boomerang_down', 'triple_tap_spatial_boomerang_left', 'triple_tap_spatial_boomerang_right'
    ]},

    taps_2f: { label: "2 Finger Taps", defaultOn: true, gestures: [
        'tap_2f', 'tap_2f_vertical', 'tap_2f_horizontal', 'tap_2f_diagonal_se', 'tap_2f_diagonal_sw',
        'double_tap_2f', 'double_tap_2f_vertical', 'double_tap_2f_horizontal', 'double_tap_2f_diagonal_se', 'double_tap_2f_diagonal_sw',
        'triple_tap_2f', 'triple_tap_2f_vertical', 'triple_tap_2f_horizontal', 'triple_tap_2f_diagonal_se', 'triple_tap_2f_diagonal_sw',
        'long_tap_2f', 'long_tap_2f_vertical', 'long_tap_2f_horizontal', 'long_tap_2f_diagonal_se', 'long_tap_2f_diagonal_sw'
    ]},

    taps_3f: { label: "3 Finger Taps", defaultOn: true, gestures: [
        'tap_3f', 'tap_3f_vertical', 'tap_3f_horizontal', 'tap_3f_diagonal_se', 'tap_3f_diagonal_sw',
        'double_tap_3f', 'double_tap_3f_vertical', 'double_tap_3f_horizontal', 'double_tap_3f_diagonal_se', 'double_tap_3f_diagonal_sw',
        'triple_tap_3f', 'triple_tap_3f_vertical', 'triple_tap_3f_horizontal', 'triple_tap_3f_diagonal_se', 'triple_tap_3f_diagonal_sw',
        'long_tap_3f', 'long_tap_3f_vertical', 'long_tap_3f_horizontal', 'long_tap_3f_diagonal_se', 'long_tap_3f_diagonal_sw'
    ]},

    swipes: { label: "Swipes", defaultOn: true, gestures: [
        'swipe_any', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 'swipe_nw', 'swipe_ne', 'swipe_sw', 'swipe_se'
    ]},

    swipes_long: { label: "Long Swipes", defaultOn: true, gestures: [
        'swipe_long_any', 'swipe_long_up', 'swipe_long_down', 'swipe_long_left', 'swipe_long_right', 
        'swipe_long_nw', 'swipe_long_ne', 'swipe_long_sw', 'swipe_long_se'
    ]},

    swipes_2f: { label: "2 Finger Swipes", defaultOn: true, gestures: [
        'swipe_any_2f', 'swipe_up_2f', 'swipe_down_2f', 'swipe_left_2f', 'swipe_right_2f', 
        'swipe_nw_2f', 'swipe_ne_2f', 'swipe_sw_2f', 'swipe_se_2f'
    ]},

    swipes_pinch: { label: "Pinch Swipes", defaultOn: false, gestures: [
        'pinch_swipe_any_2f', 'pinch_swipe_up_2f', 'pinch_swipe_down_2f', 'pinch_swipe_left_2f', 'pinch_swipe_right_2f',
        'expand_swipe_any_2f', 'expand_swipe_up_2f', 'expand_swipe_down_2f', 'expand_swipe_left_2f', 'expand_swipe_right_2f'
    ]},

    swipes_3f: { label: "3 Finger Swipes", defaultOn: true, gestures: [
        'swipe_any_3f', 'swipe_up_3f', 'swipe_down_3f', 'swipe_left_3f', 'swipe_right_3f', 
        'swipe_nw_3f', 'swipe_ne_3f', 'swipe_sw_3f', 'swipe_se_3f'
    ]},

    boomerangs: { label: "Boomerangs", defaultOn: true, gestures: [
        'boomerang_any', 'boomerang_up', 'boomerang_down', 'boomerang_left', 'boomerang_right', 
        'boomerang_nw', 'boomerang_ne', 'boomerang_sw', 'boomerang_se'
    ]},

    boomerangs_2f: { label: "2 Finger Boomerangs", defaultOn: false, gestures: [
        'boomerang_any_2f', 'boomerang_up_2f', 'boomerang_down_2f', 'boomerang_left_2f', 'boomerang_right_2f', 
        'boomerang_nw_2f', 'boomerang_ne_2f', 'boomerang_sw_2f', 'boomerang_se_2f'
    ]},

    boomerangs_3f: { label: "3 Finger Boomerangs", defaultOn: false, gestures: [
        'boomerang_any_3f', 'boomerang_up_3f', 'boomerang_down_3f', 'boomerang_left_3f', 'boomerang_right_3f', 
        'boomerang_nw_3f', 'boomerang_ne_3f', 'boomerang_sw_3f', 'boomerang_se_3f'
    ]},

    boomerangs_long: { label: "Long Boomerangs", defaultOn: false, gestures: [
        'long_boomerang_any', 'long_boomerang_up', 'long_boomerang_down', 'long_boomerang_left', 'long_boomerang_right', 
        'long_boomerang_nw', 'long_boomerang_ne', 'long_boomerang_sw', 'long_boomerang_se'
    ]},

    boomerangs_long_2f: { label: "2 Finger Long Boomerangs", defaultOn: false, gestures: [
        'long_boomerang_any_2f', 'long_boomerang_up_2f', 'long_boomerang_down_2f', 'long_boomerang_left_2f', 'long_boomerang_right_2f', 
        'long_boomerang_nw_2f', 'long_boomerang_ne_2f', 'long_boomerang_sw_2f', 'long_boomerang_se_2f'
    ]},

    switchbacks: { label: "Switchbacks (V-Shape)", defaultOn: false, gestures: [
        'switchback_any', 'switchback_any_cw', 'switchback_any_ccw', 'switchback_up_cw', 'switchback_down_cw', 
        'switchback_left_cw', 'switchback_right_cw', 'switchback_nw_cw', 'switchback_ne_cw', 'switchback_sw_cw', 'switchback_se_cw',
        'switchback_up_ccw', 'switchback_down_ccw', 'switchback_left_ccw', 'switchback_right_ccw', 'switchback_nw_ccw', 
        'switchback_ne_ccw', 'switchback_sw_ccw', 'switchback_se_ccw'
    ]},

    zigzags: { label: "Zigzags (N-Shape)", defaultOn: false, gestures: [
        'zigzag_any', 'zigzag_any_cw', 'zigzag_any_ccw', 'zigzag_up_cw', 'zigzag_down_cw', 'zigzag_left_cw', 'zigzag_right_cw', 
        'zigzag_nw_cw', 'zigzag_ne_cw', 'zigzag_sw_cw', 'zigzag_se_cw', 'zigzag_up_ccw', 'zigzag_down_ccw', 'zigzag_left_ccw', 
        'zigzag_right_ccw', 'zigzag_nw_ccw', 'zigzag_ne_ccw', 'zigzag_sw_ccw', 'zigzag_se_ccw'
    ]},

    corners: { label: "Corners", defaultOn: false, gestures: [
        'corner_any', 'corner_cw', 'corner_ccw', 'corner_up_cw', 'corner_right_cw', 'corner_down_cw', 'corner_left_cw', 
        'corner_up_ccw', 'corner_left_ccw', 'corner_down_ccw', 'corner_right_ccw'
    ]},

    triangles: { label: "Triangles", defaultOn: false, gestures: [
        'triangle_any', 'triangle_cw', 'triangle_ccw', 'triangle_up_cw', 'triangle_right_cw', 'triangle_down_cw', 'triangle_left_cw', 
        'triangle_up_ccw', 'triangle_left_ccw', 'triangle_down_ccw', 'triangle_right_ccw'
    ]},

    u_shapes: { label: "U Shapes", defaultOn: false, gestures: [
        'u_shape_any', 'u_shape_cw', 'u_shape_ccw', 'u_shape_up_cw', 'u_shape_right_cw', 'u_shape_down_cw', 'u_shape_left_cw', 
        'u_shape_up_ccw', 'u_shape_left_ccw', 'u_shape_down_ccw', 'u_shape_right_ccw'
    ]},

    squares: { label: "Squares", defaultOn: false, gestures: [
        'square_any', 'square_cw', 'square_ccw', 'square_up_cw', 'square_right_cw', 'square_down_cw', 'square_left_cw', 
        'square_up_ccw', 'square_left_ccw', 'square_down_ccw', 'square_right_ccw'
    ]},

    motion_swipes: { label: "Motion Swipes", defaultOn: false, gestures: [
        'motion_tap_swipe_any', 'motion_tap_swipe_up', 'motion_tap_swipe_down', 'motion_tap_swipe_left', 'motion_tap_swipe_right', 
        'motion_tap_swipe_nw', 'motion_tap_swipe_ne', 'motion_tap_swipe_sw', 'motion_tap_swipe_se'
    ]},

    motion_swipes_long: { label: "Long Motion Swipes", defaultOn: false, gestures: [
        'motion_tap_swipe_long_any', 'motion_tap_swipe_long_up', 'motion_tap_swipe_long_down', 'motion_tap_swipe_long_left', 
        'motion_tap_swipe_long_right', 'motion_tap_swipe_long_nw', 'motion_tap_swipe_long_ne', 'motion_tap_swipe_long_sw', 'motion_tap_swipe_long_se'
    ]},

    motion_boomerangs: { label: "Motion Boomerangs", defaultOn: false, gestures: [
        'motion_tap_boomerang_any', 'motion_tap_boomerang_up', 'motion_tap_boomerang_down', 'motion_tap_boomerang_left', 
        'motion_tap_boomerang_right', 'motion_tap_boomerang_nw', 'motion_tap_boomerang_ne', 'motion_tap_boomerang_sw', 'motion_tap_boomerang_se'
    ]},

    motion_corners: { label: "Motion Corners", defaultOn: false, gestures: [
        'motion_tap_corner_any', 'motion_tap_corner_cw', 'motion_tap_corner_ccw', 'motion_tap_corner_up_cw', 'motion_tap_corner_right_cw', 
        'motion_tap_corner_left_cw', 'motion_tap_corner_down_cw', 'motion_tap_corner_up_ccw', 'motion_tap_corner_right_ccw', 
        'motion_tap_corner_left_ccw', 'motion_tap_corner_down_ccw'
    ]},

    flicks: { label: "Flicks", defaultOn: false, gestures: [
        'Flick_any', 'Flick_up', 'Flick_down', 'Flick_left', 'Flick_right', 'Flick_nw', 'Flick_ne', 'Flick_sw', 'Flick_se'
    ]},

    pausing_swipes: { label: "Pausing Swipes", defaultOn: false, gestures: [
        'Pausing_swipe_any', 'Pausing_swipe_up', 'Pausing_swipe_down', 'Pausing_swipe_left', 'Pausing_swipe_right', 
        'Pausing_swipe_nw', 'Pausing_swipe_ne', 'Pausing_swipe_sw', 'Pausing_swipe_se'
    ]},

    pausing_boomerangs: { label: "Pausing Boomerangs", defaultOn: false, gestures: [
        'Pausing_boomerang_any', 'Pausing_boomerang_up', 'Pausing_boomerang_down', 'Pausing_boomerang_left', 'Pausing_boomerang_right', 
        'Pausing_boomerang_nw', 'Pausing_boomerang_ne', 'Pausing_boomerang_sw', 'Pausing_boomerang_se'
    ]},

    pausing_switchbacks: { label: "Pausing Switchbacks", defaultOn: false, gestures: [
        'Pausing_Switchback_any', 'Pausing_Switchback_cw', 'Pausing_Switchback_ccw', 'Pausing_Switchback_up_cw', 'Pausing_Switchback_down_cw', 
        'Pausing_Switchback_left_cw', 'Pausing_Switchback_right_cw', 'Pausing_Switchback_nw_cw', 'Pausing_Switchback_ne_cw', 
        'Pausing_Switchback_sw_cw', 'Pausing_Switchback_se_cw', 'Pausing_Switchback_up_ccw', 'Pausing_Switchback_down_ccw', 
        'Pausing_Switchback_left_ccw', 'Pausing_Switchback_right_ccw', 'Pausing_Switchback_nw_ccw', 'Pausing_Switchback_ne_ccw', 
        'Pausing_Switchback_sw_ccw', 'Pausing_Switchback_se_ccw'
    ]},

    pausing_corners: { label: "Pausing Corners", defaultOn: false, gestures: [
        'Pausing_corner_any', 'Pausing_corner_cw', 'Pausing_corner_ccw', 'Pausing_corner_up_cw', 'Pausing_corner_right_cw', 
        'Pausing_corner_down_cw', 'Pausing_corner_left_cw', 'Pausing_corner_up_ccw', 'Pausing_corner_left_ccw', 
        'Pausing_corner_down_ccw', 'Pausing_corner_right_ccw'
    ]}
};

window.geminiMods.helpDictionary = {
    touch: [
        { title: "Basic Taps", content: "Tap with 1, 2, or 3 fingers anywhere on the screen.", devOnly: false },
        { title: "Spatial Double Taps", content: "Double tap in specific zones (e.g., top-left, center) to trigger actions.", devOnly: false },
        { title: "Basic Swipes", content: "Swipe quickly in any of the 8 cardinal and diagonal directions.", devOnly: false },
        { title: "Boomerangs", content: "Swipe outward and immediately pull back to your starting point without lifting.", devOnly: false },
        { title: "Triangles & Squares", content: "Draw a continuous 3-sided or 4-sided enclosed shape.", devOnly: true },
        { title: "Switchbacks & Zigzags", content: "Sharp, multi-segment turns. Switchback = V-shape, Zigzag = N-shape.", devOnly: true },
        { title: "Flicks & Pausing Swipes", content: "Flick = high-velocity swipe. Pausing = hold finger still at the end for 300ms.", devOnly: true }
    ],
    hand: [
        { title: "Hand Tracking Basics", content: "Keep your hand within the camera frame. The engine tracks your joints.", devOnly: false },
        { title: "Chords", content: "Combining specific open/closed fingers to trigger commands.", devOnly: false },
        { title: "Skeleton Calibration", content: "Use the AR Lab to view the wireframe overlay and diagnose lighting issues.", devOnly: true }
    ]
};
              
