// gestures.js
// Version: v100 - "I-Shape" Boomerangs & Switchbacks

// --- Merged from gesture_groups.js (was a separate file, now consolidated here) ---
export const HAND_GESTURE_GROUPS = [
    {
        id: "hand_poses",
        name: "Hand Static Poses",
        enabled: true,
        gestures: [
            { id: "0", name: "✊ Fist" },
            { id: "18", name: "🤘 Rock On" },
            { id: "34", name: "🤙 Shaka" },
            { id: "48", name: "🫵 Gun / L-Shape" },
            { id: "50", name: "🤟 Spidey / ILY" }
        ]
    },
    {
        id: "hand_pinches",
        name: "Hand Pinches",
        enabled: true,
        gestures: [
            { id: "100", name: "🤏 Basic Pinch" },
            { id: "104", name: "🤌 Chef Kiss (All)" },
            { id: "105", name: "👌 OK Sign" }
        ]
    },
    {
        id: "hand_counts",
        name: "Hand Finger Counts",
        enabled: true,
        gestures: [
            { id: "16", name: "☝️ 1 Finger (Index)" },
            { id: "24", name: "✌️ 2 Fingers (Peace)" },
            { id: "28", name: "3️⃣ 3 Fingers" },
            { id: "30", name: "4️⃣ 4 Fingers" },
            { id: "62", name: "🖐️ 5 Fingers (Palm)" }
        ]
    },
    {
        id: "hand_vision_shapes",
        name: "Hand Advanced Vision Shapes",
        enabled: true,
        gestures: [
            { id: "200", name: "🪃 Boomerang Pattern" },
            { id: "201", name: "⚡ Zigzag Motion" },
            { id: "202", name: "⚓ Anchor Hold" },
            { id: "203", name: "🔄 Circular Sweep" }
        ]
    },
    {
        id: "hand_swipes",
        name: "Hand Directional Swipes",
        enabled: true,
        gestures: [
            { id: "300", name: "👆 Swipe Up" },
            { id: "301", name: "👇 Swipe Down" },
            { id: "302", name: "👈 Swipe Left" },
            { id: "303", name: "👉 Swipe Right" }
        ]
    },]
     export const TOUCH_GESTURE_GROUPS = [
    {
        id: "taps_1f",
        name: "1 Finger Regular Taps",
        enbled: true,
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
        id: "switchbacks",
        name: "Switchbacks (V-Shape)",
        enabled: false,
        gestures: [
            { id: "switchback_any", name: "switchback any" },
            { id: "switchback_any_cw", name: "switchback any cw" },
            { id: "switchback_any_ccw", name: "switchback any ccw" },
            { id: "switchback_up_cw", name: "swipe up se" },
            { id: "switchback_down_cw", name: "swipe down nw" },
            { id: "switchback_left_cw", name: "swipe left ne" },
            { id: "switchback_right_cw", name: "swipe right sw" },
            { id: "switchback_nw_cw", name: "swipe nw se" },
            { id: "switchback_ne_cw", name: "swipe ne sw" },
            { id: "switchback_sw_cw", name: "swipe sw ne" },
            { id: "switchback_se_cw", name: "swipe se nw" },
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
            { id: "zigzag_up_cw", name: "swipe up se up" },
            { id: "zigzag_down_cw", name: "swipe down nw down" },
            { id: "zigzag_left_cw", name: "swipe left ne left" },
            { id: "zigzag_right_cw", name: "swipe right sw right" },
            { id: "zigzag_nw_cw", name: "swipe nw se nw" },
            { id: "zigzag_ne_cw", name: "swipe ne sw ne" },
            { id: "zigzag_sw_cw", name: "swipe sw ne sw" },
            { id: "zigzag_se_cw", name: "swipe se nw se" },
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
            { id: "Pausing_Switchback_up_cw", name: "swipe up pause se" },
            { id: "Pausing_Switchback_down_cw", name: "swipe down pause nw" },
            { id: "Pausing_Switchback_left_cw", name: "swipe left pause ne" },
            { id: "Pausing_Switchback_right_cw", name: "swipe right pause sw" },
            { id: "Pausing_Switchback_nw_cw", name: "swipe nw pause se" },
            { id: "Pausing_Switchback_ne_cw", name: "swipe ne pause sw" },
            { id: "Pausing_Switchback_sw_cw", name: "swipe sw pause ne" },
            { id: "Pausing_Switchback_se_cw", name: "swipe se pause nw" },
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
            { id: "Pausing_corner_left_ccw", name: "swipe left down" },
            { id: "Pausing_corner_down_ccw", name: "swipe down pause right" },
            { id: "Pausing_corner_right_ccw", name: "swipe right pause up" }
        ]
    }
];



// --- End merged content ---

export class GestureEngine {
    constructor(targetElement, config, callbacks) {
        this.target = targetElement || document.body;
        this.config = Object.assign({
            tapDelay: 800,        
            longPressTime: 300,   
            swipeThreshold: 40,   
            spatialThreshold: 10, 
            tapPrecision: 30,
            longSwipeThreshold: 150, 
            multiSwipeThreshold: 10, 
            debug: false
        }, config || {});

        this.callbacks = Object.assign({
            onGesture: (data) => console.log('Gesture:', data), 
            onContinuous: (data) => console.log('Continuous:', data), 
            onDebug: (msg) => {}
        }, callbacks || {});

        this.activePointers = {};
        this.history = [];
        this.tapStack = { count: 0, fingers: 0, timer: null, posHistory: [], active: false };
        this.allowedGestures = new Set();
        this.contState = {
            rotStartAngle: 0, rotAccumulator: 0, rotLastUpdate: 0, pinchStartDist: 0,
            squiggle: { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false },
            squiggle2F: { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false }
        };

        this._bindHandlers();
    }

    updateAllowed(list) {
        this.allowedGestures = new Set(list);
    }

    _bindHandlers() {
        const t = this.target;
        t.addEventListener('pointerdown', e => this._handleDown(e), { passive: false });
        t.addEventListener('pointermove', e => this._handleMove(e), { passive: false });
        t.addEventListener('pointerup', e => this._handleUp(e), { passive: false });
        t.addEventListener('pointercancel', e => this._handleUp(e), { passive: false });
        t.addEventListener('contextmenu', e => e.preventDefault());
    }

    _handleDown(e) {
        if (e.target.tagName === 'BUTTON' && !document.body.classList.contains('input-gestures-mode')) return;
        
        this.activePointers[e.pointerId] = {
            id: e.pointerId,
            pts: [{ x: e.clientX, y: e.clientY }],
            startTime: Date.now()
        };

        const count = Object.keys(this.activePointers).length;
        const pointers = Object.values(this.activePointers);

        if (count === 1) {
            this.contState.squiggle = {
                isTracking: true, startX: e.clientX, lastX: e.clientX, direction: 0, flips: 0, hasTriggered: false
            };
        }
        
        if (count === 2) {
            const p1 = pointers[0].pts[0];
            const p2 = pointers[1].pts[0];
            this.contState.rotStartAngle = this._getRotationAngle(p1, p2);
            this.contState.rotAccumulator = 0;
            this.contState.rotLastUpdate = Date.now();
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            this.contState.pinchStartDist = Math.hypot(dx, dy);
            
            this.contState.squiggle2F = {
                isTracking: true, lastX: (p1.x + p2.x) / 2, direction: 0, flips: 0, hasTriggered: false
            };
        }
    }

    _handleMove(e) {
        if (!this.activePointers[e.pointerId]) return;
        
        if (this.contState.squiggle.isTracking || this.contState.squiggle2F.isTracking) {
             if (e.cancelable) e.preventDefault();
        }

        const ptr = this.activePointers[e.pointerId];
        ptr.pts.push({ x: e.clientX, y: e.clientY });

        const pointers = Object.values(this.activePointers);
        const count = pointers.length;
        const now = Date.now();

        // 1. Squiggle 1F (Delete)
        if (count === 1 && this.contState.squiggle.isTracking && !this.contState.squiggle.hasTriggered) {
            const x = e.clientX; 
            const dx = x - this.contState.squiggle.lastX;
            if (Math.abs(dx) > 8) { 
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle.direction !== 0 && newDir !== this.contState.squiggle.direction) {
                    this.contState.squiggle.flips++;
                }
                this.contState.squiggle.direction = newDir; 
                this.contState.squiggle.lastX = x;
                
                if (this.contState.squiggle.flips >= 4) {
                    this.contState.squiggle.hasTriggered = true;
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 1 });
                }
            }
        }

        // 2. Squiggle 2F (Clear)
        if (count === 2 && this.contState.squiggle2F.isTracking && !this.contState.squiggle2F.hasTriggered) {
            const currentAvgX = (pointers[0].pts.slice(-1)[0].x + pointers[1].pts.slice(-1)[0].x) / 2;
            const dx = currentAvgX - this.contState.squiggle2F.lastX;
            if (Math.abs(dx) > 8) {
                const newDir = dx > 0 ? 1 : -1;
                if (this.contState.squiggle2F.direction !== 0 && newDir !== this.contState.squiggle2F.direction) {
                    this.contState.squiggle2F.flips++;
                }
                this.contState.squiggle2F.direction = newDir; 
                this.contState.squiggle2F.lastX = currentAvgX;
                
                if (this.contState.squiggle2F.flips >= 4) {
                    this.contState.squiggle2F.hasTriggered = true;
                    this.callbacks.onContinuous({ type: 'squiggle', fingers: 2 });
                }
            }
        }

        // 3. Twist
        if ((count === 2 || count === 3) && (now - this.contState.rotLastUpdate > 50)) {
            const p1 = pointers[0].pts.slice(-1)[0]; 
            const p2 = pointers[1].pts.slice(-1)[0];
            const currentAngle = this._getRotationAngle(p1, p2);
            let delta = currentAngle - this.contState.rotStartAngle;
            if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
            
            this.contState.rotAccumulator += delta; 
            this.contState.rotStartAngle = currentAngle;
            
            if (Math.abs(this.contState.rotAccumulator) > 15) {
                this.callbacks.onContinuous({ type: 'twist', fingers: count, value: this.contState.rotAccumulator > 0 ? 1 : -1 });
                this.contState.rotAccumulator = 0; 
                this.contState.rotLastUpdate = now;
            }
        }

        // 4. Pinch
        if (count === 2 && this.contState.pinchStartDist > 0) {
            const p1 = pointers[0].pts.slice(-1)[0]; 
            const p2 = pointers[1].pts.slice(-1)[0];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (Math.abs(dist - this.contState.pinchStartDist) > 20) {
                this.callbacks.onContinuous({ type: 'pinch', scale: dist / this.contState.pinchStartDist });
            }
        }
    }

    _handleUp(e) {
        if (!this.activePointers[e.pointerId]) return;
        this.activePointers[e.pointerId].endTime = Date.now();
        this.history.push(this.activePointers[e.pointerId]);
        delete this.activePointers[e.pointerId];
        
        const remaining = Object.keys(this.activePointers).length;
        if (remaining === 0) {
            this.contState.pinchStartDist = 0;
            this.contState.squiggle.isTracking = false;
            this.contState.squiggle2F.isTracking = false;
            
            if (this.contState.squiggle.hasTriggered || this.contState.squiggle2F.hasTriggered) {
                this.history = []; 
                this.contState.squiggle.hasTriggered = false;
                this.contState.squiggle2F.hasTriggered = false;
                return;
            }

            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this._analyze(), 50);
        }
    }

    _analyze() {
        const inputs = this.history; this.history = []; if (inputs.length === 0) return;
        const fingers = new Set(inputs.map(s => s.id)).size;
        let sc = {x:0,y:0}, ec = {x:0,y:0};
        inputs.forEach(s => { sc.x += s.pts[0].x; sc.y += s.pts[0].y; ec.x += s.pts[s.pts.length-1].x; ec.y += s.pts[s.pts.length-1].y; });
        sc.x /= inputs.length; sc.y /= inputs.length; ec.x /= inputs.length; ec.y /= inputs.length;

        const primaryPath = inputs[0].pts;
        let segments = this._segmentPath(primaryPath);
        segments = this._cleanSegments(segments);
        segments = this._mergeSegments(segments);

        const netDist = Math.hypot(ec.x - sc.x, ec.y - sc.y);
        const pathLen = this._getPathLen(primaryPath);
        const isClosed = netDist < 50;

        let turnSum = 0; if (segments.length > 1) { for (let i = 0; i < segments.length - 1; i++) { turnSum += this._getTurnDir(segments[i].vec, segments[i + 1].vec); } }
        const winding = turnSum > 0 ? 'cw' : 'ccw';
        let type = 'tap'; let meta = { fingers: fingers };

        // --- 1. Multi-Finger Hybrid Swipes ---
        if (fingers === 2 && pathLen > 40 && netDist > 40) {
             let startSpan = 0, endSpan = 0;
             inputs.forEach(s => { const f = s.pts[0], l = s.pts[s.pts.length-1]; startSpan += Math.hypot(f.x - sc.x, f.y - sc.y); endSpan += Math.hypot(l.x - ec.x, l.y - ec.y); });
             startSpan /= 2; endSpan /= 2;
             if (Math.abs(endSpan - startSpan) > 30) {
                 const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                 if (endSpan < startSpan * 0.7) { type = 'pinch_swipe'; meta.dir = dir; }
                 else if (endSpan > startSpan * 1.3) { type = 'expand_swipe'; meta.dir = dir; }
                 this._emitGesture(type, fingers, meta); return;
             }
        }

        // --- 2. Shapes & Swipes ---
        if (type === 'tap' && pathLen > this.config.swipeThreshold) {
            
            // --- 4 Segments (Square or Long Zigzag) ---
            if (segments.length >= 4) {
                const t1 = this._getTurnDir(segments[0].vec, segments[1].vec); 
                const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
                const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
                
                if (alternating) { type = 'long_zigzag'; } 
                else if (isClosed) { type = 'square'; meta.winding = winding; } 
                else { type = 'long_zigzag'; }
                meta.dir = segments[0].dir; 
            } 
            // --- 3 Segments (Long Boomerang, Zigzag, Triangle, U-Shape) ---
            else if (segments.length === 3) {
                 if (isClosed) { type = 'triangle'; meta.dir = segments[0].dir; meta.winding = winding; } 
                 else { 
                     const t1 = this._getTurnDir(segments[0].vec, segments[1].vec); 
                     const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
                     // Check if turns alternate (Left-Right or Right-Left)
                     const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
                     
                     if (alternating) {
                         const a1 = this._getAngleDiff(segments[0].vec, segments[1].vec);
                         const a2 = this._getAngleDiff(segments[1].vec, segments[2].vec);
                         
                         // Tight "I" Shape check (Double 180 flip)
                         if (a1 >= 165 && a2 >= 165) {
                             type = 'long_boomerang';
                         } else {
                             type = 'zigzag';
                         }
                     } 
                     else {
                         const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                         // Note: 'long_boomerang' used to be here for wide curves, 
                         // but user redefined it as an I-shape. 
                         // Wide curves are now just U-Shapes or U-Shape derivatives.
                         type = 'u_shape';
                         meta.winding = winding;
                     }
                     meta.dir = segments[0].dir; 
                 }
            } 
            // --- 2 Segments (Boomerang, Switchback, Corner) ---
            else if (segments.length === 2) {
                meta.dir = segments[0].dir; 
                meta.winding = winding;
                const angle = Math.abs(this._getAngleDiff(segments[0].vec, segments[1].vec));
                
                if (angle >= 165) { type = 'boomerang'; }     // I-Shape (180 deg)
                else if (angle > 125) { type = 'switchback'; } // > Shape
                else { type = 'corner'; }                     // L Shape
            } 
            // --- 1 Segment (Swipe) ---
            else {
                const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
                let threshold = this.config.longSwipeThreshold;
                if (dir.length > 2) threshold += 60; 
                type = netDist > threshold ? 'swipe_long' : 'swipe';
                meta.dir = dir;
            }
        }

        if (fingers > 1 && type === 'tap' && netDist > this.config.multiSwipeThreshold) {
            type = 'swipe';
            if (segments.length >= 2) {
                 const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
                 if (Math.abs(angle) > 150) type = 'boomerang';
            }
            meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
        }

        if (type === 'tap') {
            const dur = inputs[0].endTime - inputs[0].startTime;
            if (dur > this.config.longPressTime) type = 'long_tap';
            if (fingers > 1) meta.align = this._getAlignment(inputs);
        }

        // --- 4. Tap Stack ---
        if (this.tapStack.active) {
            clearTimeout(this.tapStack.timer); this.tapStack.active = false;
            if (type === 'tap' && fingers === this.tapStack.fingers) {
                const seqDist = Math.hypot(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                if (seqDist > 50 && fingers === 1) {
                    const dir = this._getDirection(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
                    this._emitGesture('motion_tap', fingers, { subMode: 'spatial', dir: dir });
                    this._clearStack();
                    return;
                } else {
                    this.tapStack.count++;
                    this.tapStack.posHistory.push(ec);
                    this.tapStack.lastPos = ec;
                    this.tapStack.active = true;
                    this.tapStack.timer = setTimeout(() => this._commitStack(), this.config.tapDelay);
                    return;
                }
            }
            if (type !== 'tap' && fingers === 1 && this.tapStack.fingers === 1) {
                this._emitGesture('motion_tap', 1, { subMode: type, dir: meta.dir, winding: meta.winding });
                this._clearStack();
                return;
            }
            this._commitStack();
        }

        if (type === 'tap') { 
            this.tapStack = { 
                active: true, count: 1, fingers: fingers, 
                posHistory: [ec], lastPos: ec,
                align: meta.align, 
                timer: setTimeout(() => this._commitStack(), this.config.tapDelay) 
            }; 
            return; 
        }
        this._emitGesture(type, fingers, meta);
    }

    _commitStack() { 
        const { count, fingers, posHistory, align } = this.tapStack;
        if (count > 0) { 
            let maxDist = 0; 
            for(let i=1; i<posHistory.length; i++) {
                maxDist = Math.max(maxDist, Math.hypot(posHistory[i].x-posHistory[i-1].x, posHistory[i].y-posHistory[i-1].y));
            }

            if (maxDist > 50 && fingers === 1 && count >= 2) {
                // Spatial Taps
                if (count === 3) {
                    const v1 = { x: posHistory[1].x - posHistory[0].x, y: posHistory[1].y - posHistory[0].y };
                    const v2 = { x: posHistory[2].x - posHistory[1].x, y: posHistory[2].y - posHistory[1].y };
                    const angle = Math.abs(this._getAngleDiff(v1, v2));
                    
                    let subMode = 'spatial_line';
                    let finalDir = this._getDirection(v1.x, v1.y); 

                    if (angle > 150) {
                        subMode = 'spatial_boomerang';
                        finalDir = this._getDirection(v1.x, v1.y);
                    }
                    else if (angle > 45 && angle < 135) { 
                        subMode = 'spatial_corner'; 
                        
                        const d1 = this._getDirection(v1.x, v1.y);
                        const d2 = this._getDirection(v2.x, v2.y);
                        const combo = d1 + '_' + d2;
                        const dirMap = {
                            'up_right': 'ne',   'right_up': 'en',
                            'up_left': 'nw',    'left_up': 'wn',
                            'down_right': 'se', 'right_down': 'es',
                            'down_left': 'sw',  'left_down': 'ws'
                        };
                        if(dirMap[combo]) finalDir = dirMap[combo];
                        else finalDir = this._getDirection(v1.x + v2.x, v1.y + v2.y); 
                    }
                    this._emitGesture('triple_tap', fingers, { subMode: subMode, dir: finalDir });
                }
            } else { 
                let type = 'tap'; 
                if (count === 2) type = 'double_tap'; 
                if (count === 3) type = 'triple_tap'; 
                this._emitGesture(type, fingers, { align: align }); 
            }
            this._clearStack(); 
        } 
    }

    _clearStack() { this.tapStack = { active: false, count: 0, fingers: 0, posHistory: [], timer: null }; }

    _emitGesture(baseType, fingers, meta, overrideName = null) {
        let id = baseType;
        if (meta && meta.subMode) id += '_' + meta.subMode;
        if (meta && meta.dir && meta.dir !== 'Any' && meta.dir !== 'none') id += '_' + meta.dir.toLowerCase(); 
        
        const windingShapes = ['corner', 'triangle', 'u_shape', 'square'];
        const checkType = meta && meta.subMode ? meta.subMode : baseType;
        if (meta && meta.winding && windingShapes.some(s => checkType.includes(s))) id += '_' + meta.winding; 

        if (fingers > 1) id += '_' + fingers + 'f';

        if (meta && meta.align) {
            const map = { 
                'Vertical': 'vertical', 
                'Horizontal': 'horizontal', 
                'Diagonal SE': 'diagonal_se', 
                'Diagonal SW': 'diagonal_sw' 
            };
            if (map[meta.align]) id += `_${map[meta.align]}`;
        }

        const multiFingerBases = ['tap_2f', 'double_tap_2f', 'triple_tap_2f', 'long_tap_2f', 'tap_3f', 'double_tap_3f', 'triple_tap_3f', 'long_tap_3f'];
        if (multiFingerBases.includes(id)) id += '_any'; 
        
        let finalId = id;

        // Helper to check allow list
        const tryFallback = (candidate) => {
            if (this.allowedGestures && this.allowedGestures.has(candidate)) { finalId = candidate; return true; }
            return false;
        };

        // Try exact match first
        if (this.allowedGestures && this.allowedGestures.size > 0 && !this.allowedGestures.has(finalId)) {
            
            if (id.startsWith('swipe_long_')) {
                if (tryFallback(id.replace('swipe_long_', 'swipe_'))) {}
            } else if (id.startsWith('motion_tap_spatial_')) {
                 if (tryFallback(id.replace('motion_tap_spatial_', 'swipe_'))) {}
            }

            const alignments = ['_vertical', '_horizontal', '_diagonal_se', '_diagonal_sw'];
            for (let a of alignments) {
                if (finalId.includes(a)) {
                    let test = finalId.replace(a, '_any');
                    if (tryFallback(test)) break;
                }
            }

            if (!this.allowedGestures.has(finalId)) {
                const dirs = ['_up','_down','_left','_right','_nw','_ne','_sw','_se'];
                for (let d of dirs) {
                    if (finalId.includes(d)) {
                        let test = finalId.replace(d, '_any');
                        if (tryFallback(test)) break;
                    }
                }
            }
        }

        if (this.allowedGestures && this.allowedGestures.size > 0 && !this.allowedGestures.has(finalId)) return;
        
        const name = overrideName || finalId;
        this.callbacks.onGesture({ id: finalId, base: baseType, fingers: fingers, meta: meta, name: name });
    }

    // --- UTILS ---
    _getRotationAngle(p1, p2) { return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI; }
    _cleanSegments(segments) { return segments.filter(s => Math.hypot(s.vec.x, s.vec.y) > 15); }
    _mergeSegments(segments) {
        if (segments.length < 2) return segments;
        const merged = []; let current = segments[0];
        for (let i = 1; i < segments.length; i++) {
            const next = segments[i];
            if (Math.abs(this._getAngleDiff(current.vec, next.vec)) < 45) {
                current.vec.x += next.vec.x; current.vec.y += next.vec.y;
                current.dir = this._getDirection(current.vec.x, current.vec.y);
            } else { merged.push(current); current = next; }
        }
        merged.push(current); return merged;
    }
    _segmentPath(pts) {
        if (pts.length < 5) return [{dir: 'none', vec:{x:0,y:0}}];
        const segments = []; let start = 0; const threshold = 45; 
        for (let i = 2; i < pts.length - 2; i++) {
            const dx1 = pts[i].x - pts[start].x; const dy1 = pts[i].y - pts[start].y;
            const nextIdx = Math.min(i + 5, pts.length - 1);
            const dx2 = pts[nextIdx].x - pts[i].x; const dy2 = pts[nextIdx].y - pts[i].y;
            const a1 = Math.atan2(dy1, dx1) * 180/Math.PI; const a2 = Math.atan2(dy2, dx2) * 180/Math.PI;
            let diff = Math.abs(a1-a2); if (diff > 180) diff = 360 - diff;
            if (diff > threshold && Math.hypot(dx1,dy1) > 10) {
                segments.push({ dir: this._getDirection(dx1, dy1), vec: {x:dx1, y:dy1} }); start = i;
            }
        }
        const lastDx = pts[pts.length-1].x - pts[start].x; const lastDy = pts[pts.length-1].y - pts[start].y;
        if (Math.hypot(lastDx, lastDy) > 10) segments.push({ dir: this._getDirection(lastDx, lastDy), vec: {x:lastDx, y:lastDy} });
        return segments;
    }
    _getTurnDir(v1, v2) { return (v1.x * v2.y - v1.y * v2.x); }
    _getAngleDiff(v1, v2) { const a1 = Math.atan2(v1.y, v1.x)*180/Math.PI; const a2 = Math.atan2(v2.y, v2.x)*180/Math.PI; let d = Math.abs(a1-a2); if(d>180) d=360-d; return d; }
    _getPathLen(pts) { let l=0; for(let i=1;i<pts.length;i++) l+=Math.hypot(pts[i].x-pts[i-1].x, pts[i].y-pts[i-1].y); return l; }
    _getDirection(dx, dy) {
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        if (ang > -22.5 && ang <= 22.5) return 'right'; 
        if (ang > 22.5 && ang <= 67.5) return 'se';
        if (ang > 67.5 && ang <= 112.5) return 'down'; 
        if (ang > 112.5 && ang <= 157.5) return 'sw'; 
        if (ang > 157.5 || ang <= -157.5) return 'left'; 
        if (ang > -157.5 && ang <= -112.5) return 'nw';
        if (ang > -112.5 && ang <= -67.5) return 'up'; 
        return 'ne';
    }
    
    _getAlignment(inputs) {
        if (inputs.length < 2) return null;
        const pts = inputs.map(s => s.pts[0]);
        
        if (inputs.length === 2) {
            const p1 = pts[0];
            const p2 = pts[1];
            const dx = Math.abs(p1.x - p2.x);
            const dy = Math.abs(p1.y - p2.y);
            
            if (dy > dx * 2.5) return 'Vertical';
            if (dx > dy * 2.5) return 'Horizontal';
            
            const rawDx = p1.x - p2.x;
            const rawDy = p1.y - p2.y;
            
            if ((rawDx * rawDy) > 0) return 'Diagonal SE';
            else return 'Diagonal SW';
        }
        
        const xs = pts.map(p => p.x); const ys = pts.map(p => p.y);
        const w = Math.max(...xs) - Math.min(...xs); const h = Math.max(...ys) - Math.min(...ys);
        if (h > w * 1.5) return 'Vertical'; 
        if (w > h * 1.5) return 'Horizontal';
        return 'Diagonal SE'; 
    }
}


