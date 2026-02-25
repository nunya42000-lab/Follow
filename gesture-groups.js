// gesture-groups.js

export const GESTURE_GROUPS = [
    {
        id: "taps_1f",
        name: "1 Finger Regular Taps",
        enabled: true,
        gestures: [
            { id: "tap", name: "tap" },
            { id: "double_tap", name: "double tap" },
            { id: "triple_tap", name: "triple tap" },
            { id: "long_tap", name: "long tap" }
        ]
    },
    {
        id: "spatial_double_taps",
        name: "Spatial Double Taps",
        enabled: true,
        gestures: [
            { id: "Double_tap_spatial_any", name: "double tap spatial any" },
            { id: "Double_tap_spatial_up", name: "double tap up" },
            { id: "Double_tap_spatial_down", name: "double tap down" },
            { id: "Double_tap_spatial_left", name: "double tap left" },
            { id: "Double_tap_spatial_right", name: "double tap right" },
            { id: "Double_tap_spatial_nw", name: "double tap nw" },
            { id: "Double_tap_spatial_ne", name: "double tap ne" },
            { id: "Double_tap_spatial_sw", name: "double tap sw" },
            { id: "Double_tap_spatial_se", name: "double tap se" }
        ]
    },
    {
        id: "spatial_triple_taps",
        name: "Spatial Triple Taps",
        enabled: false,
        gestures: [
            { id: "triple_tap_spatial_line_any", name: "triple tap spatial line any" },
            { id: "triple_tap_spatial_line_up", name: "triple tap up up" },
            { id: "triple_tap_spatial_line_down", name: "triple tap down down" },
            { id: "triple_tap_spatial_line_left", name: "triple tap left left" },
            { id: "triple_tap_spatial_line_right", name: "triple tap right right" },
            { id: "triple_tap_spatial_corner_ne", name: "triple tap up right" },
            { id: "triple_tap_spatial_corner_nw", name: "triple tap up left" },
            { id: "triple_tap_spatial_corner_se", name: "triple tap down right" },
            { id: "triple_tap_spatial_corner_sw", name: "triple tap down left" },
            { id: "triple_tap_spatial_corner_en", name: "triple tap en" },
            { id: "triple_tap_spatial_corner_wn", name: "triple tap wn" },
            { id: "triple_tap_spatial_corner_es", name: "triple tap es" },
            { id: "triple_tap_spatial_corner_ws", name: "triple tap ws" },
            { id: "triple_tap_spatial_boomerang_any", name: "triple tap boomerang any" },
            { id: "triple_tap_spatial_boomerang_up", name: "triple tap up down" },
            { id: "triple_tap_spatial_boomerang_down", name: "triple tap down up" },
            { id: "triple_tap_spatial_boomerang_left", name: "triple tap left right" },
            { id: "triple_tap_spatial_boomerang_right", name: "triple tap right left" }
        ]
    },
    {
        id: "taps_2f",
        name: "2 Finger Taps",
        enabled: true,
        gestures: [
            { id: "tap_2f", name: "tap 2f" },
            { id: "tap_2f_vertical", name: "tap 2f vertical" },
            { id: "tap_2f_horizontal", name: "tap 2f horizontal" },
            { id: "tap_2f_diagonal_se", name: "tap 2f diagonal se" },
            { id: "tap_2f_diagonal_sw", name: "tap 2f diagonal sw" },
            { id: "double_tap_2f", name: "double tap 2f" },
            { id: "double_tap_2f_vertical", name: "double tap 2f vertical" },
            { id: "double_tap_2f_horizontal", name: "double tap 2f horizontal" },
            { id: "double_tap_2f_diagonal_se", name: "double tap 2f diagonal se" },
            { id: "double_tap_2f_diagonal_sw", name: "double tap 2f diagonal sw" },
            { id: "triple_tap_2f", name: "triple tap 2f" },
            { id: "triple_tap_2f_vertical", name: "triple tap 2f vertical" },
            { id: "triple_tap_2f_horizontal", name: "triple tap 2f horizontal" },
            { id: "triple_tap_2f_diagonal_se", name: "triple tap 2f diagonal se" },
            { id: "triple_tap_2f_diagonal_sw", name: "triple tap 2f diagonal sw" },
            { id: "long_tap_2f", name: "long tap 2f" },
            { id: "long_tap_2f_vertical", name: "long tap 2f vertical" },
            { id: "long_tap_2f_horizontal", name: "long tap 2f horizontal" },
            { id: "long_tap_2f_diagonal_se", name: "long tap 2f diagonal se" },
            { id: "long_tap_2f_diagonal_sw", name: "long tap 2f diagonal sw" }
        ]
    },
    {
        id: "taps_3f",
        name: "3 Finger Taps",
        enabled: true,
        gestures: [
            { id: "tap_3f", name: "tap 3f" },
            { id: "tap_3f_vertical", name: "tap 3f vertical" },
            { id: "tap_3f_horizontal", name: "tap 3f horizontal" },
            { id: "tap_3f_diagonal_se", name: "tap 3f diagonal se" },
            { id: "tap_3f_diagonal_sw", name: "tap 3f diagonal sw" },
            { id: "double_tap_3f", name: "double tap 3f" },
            { id: "double_tap_3f_vertical", name: "double tap 3f vertical" },
            { id: "double_tap_3f_horizontal", name: "double tap 3f horizontal" },
            { id: "double_tap_3f_diagonal_se", name: "double tap 3f diagonal se" },
            { id: "double_tap_3f_diagonal_sw", name: "double tap 3f diagonal sw" },
            { id: "triple_tap_3f", name: "triple tap 3f" },
            { id: "triple_tap_3f_vertical", name: "triple tap 3f vertical" },
            { id: "triple_tap_3f_horizontal", name: "triple tap 3f horizontal" },
            { id: "triple_tap_3f_diagonal_se", name: "triple tap 3f diagonal se" },
            { id: "triple_tap_3f_diagonal_sw", name: "triple tap 3f diagonal sw" },
            { id: "long_tap_3f", name: "long tap 3f" },
            { id: "long_tap_3f_vertical", name: "long tap 3f vertical" },
            { id: "long_tap_3f_horizontal", name: "long tap 3f horizontal" },
            { id: "long_tap_3f_diagonal_se", name: "long tap 3f diagonal se" },
            { id: "long_tap_3f_diagonal_sw", name: "long tap 3f diagonal sw" }
        ]
    },
    {
        id: "swipes",
        name: "Swipes",
        enabled: true,
        gestures: [
            { id: "swipe_any", name: "swipe any" },
            { id: "swipe_up", name: "swipe up" },
            { id: "swipe_down", name: "swipe down" },
            { id: "swipe_left", name: "swipe left" },
            { id: "swipe_right", name: "swipe right" },
            { id: "swipe_nw", name: "swipe nw" },
            { id: "swipe_ne", name: "swipe ne" },
            { id: "swipe_sw", name: "swipe sw" },
            { id: "swipe_se", name: "swipe se" }
        ]
    },
    {
        id: "swipes_long",
        name: "Long Swipes",
        enabled: true,
        gestures: [
            { id: "swipe_long_any", name: "swipe long any" },
            { id: "swipe_long_up", name: "long swipe up" },
            { id: "swipe_long_down", name: "long swipe down" },
            { id: "swipe_long_left", name: "long swipe left" },
            { id: "swipe_long_right", name: "long swipe right" },
            { id: "swipe_long_nw", name: "long swipe nw" },
            { id: "swipe_long_ne", name: "long swipe ne" },
            { id: "swipe_long_sw", name: "long swipe sw" },
            { id: "swipe_long_se", name: "long swipe se" }
        ]
    },
    {
        id: "swipes_2f",
        name: "2 Finger Swipes",
        enabled: true,
        gestures: [
            { id: "swipe_any_2f", name: "swipe any 2f" },
            { id: "swipe_up_2f", name: "swipe up 2f" },
            { id: "swipe_down_2f", name: "swipe down 2f" },
            { id: "swipe_left_2f", name: "swipe left 2f" },
            { id: "swipe_right_2f", name: "swipe right 2f" },
            { id: "swipe_nw_2f", name: "swipe nw 2f" },
            { id: "swipe_ne_2f", name: "swipe ne 2f" },
            { id: "swipe_sw_2f", name: "swipe sw 2f" },
            { id: "swipe_se_2f", name: "swipe se 2f" }
        ]
    },
    {
        id: "pinch_swipes",
        name: "Pinch Swipes",
        enabled: false,
        gestures: [
            { id: "pinch_swipe_any_2f", name: "pinch swipe any 2f" },
            { id: "pinch_swipe_up_2f", name: "pinch swipe up 2f" },
            { id: "pinch_swipe_down_2f", name: "pinch swipe down 2f" },
            { id: "pinch_swipe_left_2f", name: "pinch swipe left 2f" },
            { id: "pinch_swipe_right_2f", name: "pinch swipe right 2f" },
            { id: "expand_swipe_any_2f", name: "expand swipe any 2f" },
            { id: "expand_swipe_up_2f", name: "expand swipe up 2f" },
            { id: "expand_swipe_down_2f", name: "expand swipe down 2f" },
            { id: "expand_swipe_left_2f", name: "expand swipe left 2f" },
            { id: "expand_swipe_right_2f", name: "expand swipe right 2f" }
        ]
    },
    {
        id: "swipes_3f",
        name: "3 Finger Swipes",
        enabled: true,
        gestures: [
            { id: "swipe_any_3f", name: "swipe any 3f" },
            { id: "swipe_up_3f", name: "swipe up 3f" },
            { id: "swipe_down_3f", name: "swipe down 3f" },
            { id: "swipe_left_3f", name: "swipe left 3f" },
            { id: "swipe_right_3f", name: "swipe right 3f" },
            { id: "swipe_nw_3f", name: "swipe nw 3f" },
            { id: "swipe_ne_3f", name: "swipe ne 3f" },
            { id: "swipe_sw_3f", name: "swipe sw 3f" },
            { id: "swipe_se_3f", name: "swipe se 3f" }
        ]
    },
    {
        id: "boomerangs",
        name: "Boomerangs",
        enabled: true,
        gestures: [
            { id: "boomerang_any", name: "boomerang any" },
            { id: "boomerang_up", name: "swipe up down" },
            { id: "boomerang_down", name: "swipe down up" },
            { id: "boomerang_left", name: "swipe left right" },
            { id: "boomerang_right", name: "swipe right left" },
            { id: "boomerang_nw", name: "boomerang nw" },
            { id: "boomerang_ne", name: "boomerang ne" },
            { id: "boomerang_sw", name: "boomerang sw" },
            { id: "boomerang_se", name: "boomerang se" }
        ]
    },
    {
        id: "boomerangs_2f",
        name: "2 Finger Boomerangs",
        enabled: false,
        gestures: [
            { id: "boomerang_any_2f", name: "boomerang any 2f" },
            { id: "boomerang_up_2f", name: "swipe up down 2f" },
            { id: "boomerang_down_2f", name: "swipe down up 2f" },
            { id: "boomerang_left_2f", name: "swipe left right 2f" },
            { id: "boomerang_right_2f", name: "swipe right left 2f" }
        ]
    },
    {
        id: "boomerangs_3f",
        name: "3 Finger Boomerangs",
        enabled: false,
        gestures: [
            { id: "boomerang_any_3f", name: "boomerang any 3f" },
            { id: "boomerang_up_3f", name: "swipe up down 3f" },
            { id: "boomerang_down_3f", name: "swipe down up 3f" },
            { id: "boomerang_left_3f", name: "swipe left right 3f" },
            { id: "boomerang_right_3f", name: "swipe right left 3f" }
        ]
    },
    {
        id: "boomerangs_long",
        name: "Long Boomerangs",
        enabled: false,
        gestures: [
            { id: "long_boomerang_any", name: "long boomerang any" },
            { id: "long_boomerang_up", name: "swipe up down up" },
            { id: "long_boomerang_down", name: "swipe down up down" },
            { id: "long_boomerang_left", name: "swipe left right left" },
            { id: "long_boomerang_right", name: "swipe right left right" }
        ]
    },
    {
        id: "boomerangs_long_2f",
        name: "2 Finger Long Boomerangs",
        enabled: false,
        gestures: [
            { id: "long_boomerang_any_2f", name: "long boomerang any 2f" },
            { id: "long_boomerang_up_2f", name: "swipe up down up 2f" },
            { id: "long_boomerang_down_2f", name: "swipe down up down 2f" },
            { id: "long_boomerang_left_2f", name: "swipe left right left 2f" },
            { id: "long_boomerang_right_2f", name: "swipe right left right 2f" }
        ]
    },
    {
   {
       id: "switchbacks",
       name: "Switchbacks (V-Shape)",
       enabled: false,
       gestures: [
           { id: "switchback_any", name: "switchback any" },
           { id: "switchback_any_cw", name: "switchback any cw" },
           { id: "switchback_any_ccw", name: "switchback any ccw" },
           // Clockwise
           { id: "switchback_up_cw", name: "swipe up se" },
           { id: "switchback_down_cw", name: "swipe down nw" },
           { id: "switchback_left_cw", name: "swipe left ne" },
           { id: "switchback_right_cw", name: "swipe right sw" },
           { id: "switchback_nw_cw", name: "swipe nw se" },
           { id: "switchback_ne_cw", name: "swipe ne sw" },
           { id: "switchback_sw_cw", name: "swipe sw ne" },
           { id: "switchback_se_cw", name: "swipe se nw" },
           // Counter-Clockwise
           { id: "switchback_up_ccw", name: "swipe up sw" },
           { id: "switchback_down_ccw", name: "swipe down ne" },
           { id: "switchback_left_ccw", name: "swipe left se" },
           { id: "switchback_right_ccw", name: "swipe right nw" },
           { id: "switchback_nw_ccw", name: "swipe nw sw" },
           { id: "switchback_ne_ccw", name: "swipe ne se" },
           { id: "switchback_sw_ccw", name: "swipe sw nw" },
           { id: "switchback_se_ccw", name: "swipe se ne" }
       ]
   },
   {
       id: "zigzags",
       name: "Zigzags (N-Shape)",
       enabled: false,
       gestures: [
           { id: "zigzag_any", name: "zigzag any" },
           { id: "zigzag_any_cw", name: "zigzag any cw" },
           { id: "zigzag_any_ccw", name: "zigzag any ccw" },
           // Clockwise
           { id: "zigzag_up_cw", name: "swipe up se up" },
           { id: "zigzag_down_cw", name: "swipe down nw down" },
           { id: "zigzag_left_cw", name: "swipe left ne left" },
           { id: "zigzag_right_cw", name: "swipe right sw right" },
           { id: "zigzag_nw_cw", name: "swipe nw se nw" },
           { id: "zigzag_ne_cw", name: "swipe ne sw ne" },
           { id: "zigzag_sw_cw", name: "swipe sw ne sw" },
           { id: "zigzag_se_cw", name: "swipe se nw se" },
           // Counter-Clockwise
           { id: "zigzag_up_ccw", name: "swipe up sw up" },
           { id: "zigzag_down_ccw", name: "swipe down ne down" },
           { id: "zigzag_left_ccw", name: "swipe left se left" },
           { id: "zigzag_right_ccw", name: "swipe right nw right" },
           { id: "zigzag_nw_ccw", name: "swipe nw sw nw" },
           { id: "zigzag_ne_ccw", name: "swipe ne se ne" },
           { id: "zigzag_sw_ccw", name: "swipe sw nw sw" },
           { id: "zigzag_se_ccw", name: "swipe se ne se" }
       ]
   },
   {
       id: "corners",
       name: "Corners",
       enabled: false,
       gestures: [
           { id: "corner_any", name: "corner any" },
           { id: "corner_cw", name: "corner cw" },
           { id: "corner_ccw", name: "corner ccw" },
           { id: "corner_up_cw", name: "swipe up right" },
           { id: "corner_right_cw", name: "swipe right down" },
           { id: "corner_down_cw", name: "swipe down left" },
           { id: "corner_left_cw", name: "swipe left up" },
           { id: "corner_up_ccw", name: "swipe up left" },
           { id: "corner_left_ccw", name: "swipe left down" },
           { id: "corner_down_ccw", name: "swipe down right" },
           { id: "corner_right_ccw", name: "swipe right up" }
       ]
   },
   {
       id: "triangles",
       name: "Triangles",
       enabled: false,
       gestures: [
           { id: "triangle_any", name: "triangle any" },
           { id: "triangle_cw", name: "triangle cw" },
           { id: "triangle_ccw", name: "triangle ccw" },
           { id: "triangle_up_cw", name: "swipe up right sw" },
           { id: "triangle_right_cw", name: "swipe right down nw" },
           { id: "triangle_down_cw", name: "swipe down left ne" },
           { id: "triangle_left_cw", name: "swipe left up se" },
           { id: "triangle_up_ccw", name: "swipe up left se" },
           { id: "triangle_left_ccw", name: "swipe left down ne" },
           { id: "triangle_down_ccw", name: "swipe down right nw" },
           { id: "triangle_right_ccw", name: "swipe right up sw" }
       ]
   },
   {
       id: "u_shapes",
       name: "U Shapes",
       enabled: false,
       gestures: [
           { id: "u_shape_any", name: "u shape any" },
           { id: "u_shape_cw", name: "u shape cw" },
           { id: "u_shape_ccw", name: "u shape ccw" },
           { id: "u_shape_up_cw", name: "swipe up right down" },
           { id: "u_shape_right_cw", name: "swipe right down left" },
           { id: "u_shape_down_cw", name: "swipe down left up" },
           { id: "u_shape_left_cw", name: "swipe left up right" },
           { id: "u_shape_up_ccw", name: "swipe up left down" },
           { id: "u_shape_left_ccw", name: "swipe left down right" },
           { id: "u_shape_down_ccw", name: "swipe down right up" },
           { id: "u_shape_right_ccw", name: "swipe right up left" }
       ]
   },
   {
       id: "squares",
       name: "Squares",
       enabled: false,
       gestures: [
           { id: "square_any", name: "square any" },
           { id: "square_cw", name: "square cw" },
           { id: "square_ccw", name: "square ccw" },
           { id: "square_up_cw", name: "swipe up right down left" },
           { id: "square_right_cw", name: "swipe right down left up" },
           { id: "square_down_cw", name: "swipe down left up right" },
           { id: "square_left_cw", name: "swipe left up right down" },
           { id: "square_up_ccw", name: "swipe up left down right" },
           { id: "square_left_ccw", name: "swipe left down right up" },
           { id: "square_down_ccw", name: "swipe down right up left" },
           { id: "square_right_ccw", name: "swipe right up left down" }
       ]
   },
   {
       id: "motion_swipes",
       name: "Motion Swipes",
       enabled: false,
       gestures: [
           { id: "motion_tap_swipe_any", name: "motion tap swipe any" },
           { id: "motion_tap_swipe_up", name: "tap swipe up" },
           { id: "motion_tap_swipe_down", name: "tap swipe down" },
           { id: "motion_tap_swipe_left", name: "tap swipe left" },
           { id: "motion_tap_swipe_right", name: "tap swipe right" },
           { id: "motion_tap_swipe_nw", name: "tap swipe nw" },
           { id: "motion_tap_swipe_ne", name: "tap swipe ne" },
           { id: "motion_tap_swipe_sw", name: "tap swipe sw" },
           { id: "motion_tap_swipe_se", name: "tap swipe se" }
       ]
   },
   {
       id: "motion_swipes_long",
       name: "Long Motion Swipes",
       enabled: false,
       gestures: [
           { id: "motion_tap_swipe_long_any", name: "motion tap swipe long any" },
           { id: "motion_tap_swipe_long_up", name: "tap long swipe up" },
           { id: "motion_tap_swipe_long_down", name: "tap long swipe down" },
           { id: "motion_tap_swipe_long_left", name: "tap long swipe left" },
           { id: "motion_tap_swipe_long_right", name: "tap long swipe right" },
           { id: "motion_tap_swipe_long_nw", name: "tap long swipe nw" },
           { id: "motion_tap_swipe_long_ne", name: "tap long swipe ne" },
           { id: "motion_tap_swipe_long_sw", name: "tap long swipe sw" },
           { id: "motion_tap_swipe_long_se", name: "tap long swipe se" }
       ]
   },
   {
       id: "motion_boomerangs",
       name: "Motion Boomerangs",
       enabled: false,
       gestures: [
           { id: "motion_tap_boomerang_any", name: "motion tap boomerang any" },
           { id: "motion_tap_boomerang_up", name: "tap swipe up down" },
           { id: "motion_tap_boomerang_down", name: "tap swipe down up" },
           { id: "motion_tap_boomerang_left", name: "tap swipe left right" },
           { id: "motion_tap_boomerang_right", name: "tap swipe right left" },
           { id: "motion_tap_boomerang_nw", name: "tap swipe nw se" },
           { id: "motion_tap_boomerang_ne", name: "tap swipe ne sw" },
           { id: "motion_tap_boomerang_sw", name: "tap swipe sw ne" },
           { id: "motion_tap_boomerang_se", name: "tap swipe se nw" }
       ]
   },
   {
       id: "motion_corners",
       name: "Motion Corners",
       enabled: false,
       gestures: [
           { id: "motion_tap_corner_any", name: "motion tap corner any" },
           { id: "motion_tap_corner_cw", name: "motion tap corner cw" },
           { id: "motion_tap_corner_ccw", name: "motion tap corner ccw" },
           { id: "motion_tap_corner_up_cw", name: "tap swipe up right" },
           { id: "motion_tap_corner_right_cw", name: "tap swipe right down" },
           { id: "motion_tap_corner_left_cw", name: "tap swipe left up" },
           { id: "motion_tap_corner_down_cw", name: "tap swipe down left" },
           { id: "motion_tap_corner_up_ccw", name: "tap swipe up left" },
           { id: "motion_tap_corner_right_ccw", name: "tap swipe right up" },
           { id: "motion_tap_corner_left_ccw", name: "tap swipe left down" },
           { id: "motion_tap_corner_down_ccw", name: "tap swipe down right" }
       ]
   },
   {
       id: "flicks",
       name: "Flicks",
       enabled: false,
       gestures: [
           { id: "Flick_any", name: "flick any" },
           { id: "Flick_up", name: "flick up" },
           { id: "Flick_down", name: "flick down" },
           { id: "Flick_left", name: "flick left" },
           { id: "Flick_right", name: "flick right" },
           { id: "Flick_nw", name: "flick nw" },
           { id: "Flick_ne", name: "flick ne" },
           { id: "Flick_sw", name: "flick sw" },
           { id: "Flick_se", name: "flick se" }
       ]
   },
   {
       id: "pausing_swipes",
       name: "Pausing Swipes",
       enabled: false,
       gestures: [
           { id: "Pausing_swipe_any", name: "pausing swipe any" },
           { id: "Pausing_swipe_up", name: "swipe up pause up" },
           { id: "Pausing_swipe_down", name: "swipe down pause down" },
           { id: "Pausing_swipe_left", name: "swipe left pause left" },
           { id: "Pausing_swipe_right", name: "swipe right pause right" },
           { id: "Pausing_swipe_nw", name: "swipe nw pause nw" },
           { id: "Pausing_swipe_ne", name: "swipe ne pause ne" },
           { id: "Pausing_swipe_sw", name: "swipe sw pause sw" },
           { id: "Pausing_swipe_se", name: "swipe se pause se" }
       ]
   },
   {
       id: "pausing_boomerangs",
       name: "Pausing Boomerangs",
       enabled: false,
       gestures: [
           { id: "Pausing_boomerang_any", name: "pausing boomerang any" },
           { id: "Pausing_boomerang_up", name: "swipe up pause down" },
           { id: "Pausing_boomerang_down", name: "swipe down pause up" },
           { id: "Pausing_boomerang_left", name: "swipe left pause right" },
           { id: "Pausing_boomerang_right", name: "swipe right pause left" },
           { id: "Pausing_boomerang_nw", name: "swipe nw pause se" },
           { id: "Pausing_boomerang_ne", name: "swipe ne pause sw" },
           { id: "Pausing_boomerang_sw", name: "swipe sw pause ne" },
           { id: "Pausing_boomerang_se", name: "swipe se pause nw" }
       ]
   },
   {
       id: "pausing_switchbacks",
       name: "Pausing Switchbacks",
       enabled: false,
       gestures: [
           { id: "Pausing_Switchback_any", name: "pausing switchback any" },
           { id: "Pausing_Switchback_cw", name: "pausing switchback cw" },
           { id: "Pausing_Switchback_ccw", name: "pausing switchback ccw" },
           // Clockwise
           { id: "Pausing_Switchback_up_cw", name: "swipe up pause se" },
           { id: "Pausing_Switchback_down_cw", name: "swipe down pause nw" },
           { id: "Pausing_Switchback_left_cw", name: "swipe left pause ne" },
           { id: "Pausing_Switchback_right_cw", name: "swipe right pause sw" },
           { id: "Pausing_Switchback_nw_cw", name: "swipe nw pause se" },
           { id: "Pausing_Switchback_ne_cw", name: "swipe ne pause sw" },
           { id: "Pausing_Switchback_sw_cw", name: "swipe sw pause ne" },
           { id: "Pausing_Switchback_se_cw", name: "swipe se pause nw" },
           // Counter-Clockwise
           { id: "Pausing_Switchback_up_ccw", name: "swipe up pause sw" },
           { id: "Pausing_Switchback_down_ccw", name: "swipe down pause ne" },
           { id: "Pausing_Switchback_left_ccw", name: "swipe left pause se" },
           { id: "Pausing_Switchback_right_ccw", name: "swipe right pause nw" },
           { id: "Pausing_Switchback_nw_ccw", name: "swipe nw pause sw" },
           { id: "Pausing_Switchback_ne_ccw", name: "swipe ne pause se" },
           { id: "Pausing_Switchback_sw_ccw", name: "swipe sw pause nw" },
           { id: "Pausing_Switchback_se_ccw", name: "swipe se pause ne" }
       ]
   },
   {
       id: "pausing_corners",
       name: "Pausing Corners",
       enabled: false,
       gestures: [
           { id: "Pausing_corner_any", name: "pausing corner any" },
           { id: "Pausing_corner_cw", name: "pausing corner cw" },
           { id: "Pausing_corner_ccw", name: "pausing corner ccw" },
           { id: "Pausing_corner_up_cw", name: "swipe up pause right" },
           { id: "Pausing_corner_right_cw", name: "swipe right pause down" },
           { id: "Pausing_corner_down_cw", name: "swipe down pause left" },
           { id: "Pausing_corner_left_cw", name: "swipe left pause up" },
           { id: "Pausing_corner_up_ccw", name: "swipe up pause left" },
           { id: "Pausing_corner_left_ccw", name: "swipe left pause down" },
           { id: "Pausing_corner_down_ccw", name: "swipe down pause right" },
           { id: "Pausing_corner_right_ccw", name: "swipe right pause up" }
       ]
   }
   ];


