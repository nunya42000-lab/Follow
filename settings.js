import { HAND_GESTURE_GROUPS } from './gestures.js';
export const PREMADE_THEMES = {
	'default': { name: "Default Dark", bgMain: "#000000", bgCard: "#121212", bubble: "#4f46e5", btn: "#1a1a1a", text: "#e5e5e5" },
	'light': { name: "Light Mode", bgMain: "#f3f4f6", bgCard: "#ffffff", bubble: "#4f46e5", btn: "#e5e7eb", text: "#111827" },
	'matrix': { name: "The Matrix", bgMain: "#000000", bgCard: "#0f2b0f", bubble: "#003300", btn: "#001100", text: "#00ff41" },
	'dracula': { name: "Vampire", bgMain: "#282a36", bgCard: "#44475a", bubble: "#ff5555", btn: "#6272a4", text: "#f8f8f2" },
	'neon': { name: "Neon City", bgMain: "#0b0014", bgCard: "#180029", bubble: "#d900ff", btn: "#24003d", text: "#00eaff" },
	'retro': { name: "Retro PC", bgMain: "#fdf6e3", bgCard: "#eee8d5", bubble: "#cb4b16", btn: "#93a1a1", text: "#586e75" },
	'steampunk': { name: "Steampunk", bgMain: "#100c08", bgCard: "#2b1d16", bubble: "#b87333", btn: "#422a18", text: "#d5c5a3" },
	'ocean': { name: "Ocean Blue", bgMain: "#0f172a", bgCard: "#1e293b", bubble: "#0ea5e9", btn: "#334155", text: "#e2e8f0" },
	'cyber': { name: "Cyberpunk", bgMain: "#050505", bgCard: "#1a1625", bubble: "#d946ef", btn: "#2d1b4e", text: "#f0abfc" },
	'volcano': { name: "Volcano", bgMain: "#1a0505", bgCard: "#450a0a", bubble: "#b91c1c", btn: "#7f1d1d", text: "#fecaca" },
	'forest': { name: "Deep Forest", bgMain: "#021408", bgCard: "#064e3b", bubble: "#166534", btn: "#14532d", text: "#dcfce7" },
	'sunset': { name: "Sunset", bgMain: "#1a021c", bgCard: "#701a75", bubble: "#fb923c", btn: "#86198f", text: "#fff7ed" },
	'halloween': { name: "Halloween 🎃", bgMain: "#1a0500", bgCard: "#2e0a02", bubble: "#ff6600", btn: "#4a1005", text: "#ffbf00" },
	'liberty': { name: "Liberty 🗽", bgMain: "#0d1b1e", bgCard: "#1c3f44", bubble: "#2e8b57", btn: "#143136", text: "#d4af37" },
	'shamrock': { name: "Shamrock ☘️", bgMain: "#021a02", bgCard: "#053305", bubble: "#00c92c", btn: "#0a450a", text: "#e0ffe0" },
	'midnight': { name: "Midnight 🌑", bgMain: "#000000", bgCard: "#111111", bubble: "#3b82f6", btn: "#1f1f1f", text: "#ffffff" },
	'candy': { name: "Candy 🍬", bgMain: "#260516", bgCard: "#4a0a2f", bubble: "#ff69b4", btn: "#701046", text: "#ffe4e1" },
	'bumblebee': { name: "Bumblebee 🐝", bgMain: "#1a1600", bgCard: "#332b00", bubble: "#fbbf24", btn: "#4d4100", text: "#ffffff" },
	'blueprint': { name: "Blueprint 📐", bgMain: "#0f2e52", bgCard: "#1b4d8a", bubble: "#ffffff", btn: "#2563eb", text: "#ffffff" },
	'rose': { name: "Rose Gold 🌹", bgMain: "#1f1212", bgCard: "#3d2323", bubble: "#e1adac", btn: "#5c3333", text: "#ffe4e1" },
	'hacker': { name: "Terminal 💻", bgMain: "#0c0c0c", bgCard: "#1a1a1a", bubble: "#00ff00", btn: "#0f380f", text: "#00ff00" },
	'royal': { name: "Royal 👑", bgMain: "#120024", bgCard: "#2e0059", bubble: "#9333ea", btn: "#4c1d95", text: "#ffd700" }
};
export const PREMADE_VOICE_PRESETS = {
	'standard': { name: "Standard", pitch: 1.0, rate: 1.0, volume: 1.0 },
	'speed': { name: "Speed Reader", pitch: 1.0, rate: 1.8, volume: 1.0 },
	'slow': { name: "Slow Motion", pitch: 0.9, rate: 0.6, volume: 1.0 },
	'deep': { name: "Deep Voice", pitch: 0.6, rate: 0.9, volume: 1.0 },
	'high': { name: "Chipmunk", pitch: 1.8, rate: 1.1, volume: 1.0 },
	'robot': { name: "Robot", pitch: 0.5, rate: 0.8, volume: 1.0 },
	'announcer': { name: "Announcer", pitch: 0.8, rate: 1.1, volume: 1.0 },
	'whisper': { name: "Quiet", pitch: 1.2, rate: 0.8, volume: 0.4 }
};
const HAND_MAPPING_PRESETS = {
	'9_hand_counts': {
		name: "Finger Counts",
		type: 'key9',
		map: {
			'k9_1': '16', 'k9_2': '24', 'k9_3': '28', 'k9_4': '30', 'k9_5': '62',
			'k9_6': '34', 'k9_7': '48', 'k9_8': '50', 'k9_9': '100'
		}
	},
	'9_hand_shapes': {
		name: "Shapes & Combos",
		type: 'key9',
		map: {
			'k9_1': '200', 'k9_2': '201', 'k9_3': '203', 'k9_4': '12', 'k9_5': '20',
			'k9_6': '36', 'k9_7': '40', 'k9_8': '56', 'k9_9': '101'
		}
	},
	'12_hand_counts': {
		name: "Finger Counts Extended",
		type: 'key12',
		map: {
			'k12_1': '16', 'k12_2': '24', 'k12_3': '28', 'k12_4': '30', 'k12_5': '62',
			'k12_6': '34', 'k12_7': '48', 'k12_8': '50', 'k12_9': '100',
			'k12_10': '12', 'k12_11': '20', 'k12_12': '36'
		}
	},
	'12_hand_shapes': {
		name: "Shapes & Combos",
		type: 'key12',
		map: {
			'k12_1': '200', 'k12_2': '201', 'k12_3': '203', 'k12_4': '300', 'k12_5': '301',
			'k12_6': '302', 'k12_7': '303', 'k12_8': '14', 'k12_9': '22',
			'k12_10': '40', 'k12_11': '52', 'k12_12': '56'
		}
	},
	'piano_hand_default': {
		name: "Finger Counts",
		type: 'piano',
		map: {
			'piano_C': '16', 'piano_D': '24', 'piano_E': '28', 'piano_F': '30', 'piano_G': '62',
			'piano_A': '34', 'piano_B': '48',
			'piano_1': '50', 'piano_2': '100', 'piano_3': '12', 'piano_4': '20', 'piano_5': '36'
		}
	},
	'piano_hand_shapes': {
		name: "Shapes & Combos",
		type: 'piano',
		map: {
			'piano_C': '200', 'piano_D': '201', 'piano_E': '203', 'piano_F': '101', 'piano_G': '102',
			'piano_A': '103', 'piano_B': '40',
			'piano_1': '42', 'piano_2': '44', 'piano_3': '52', 'piano_4': '54', 'piano_5': '58'
		}
	}
};
const GESTURE_CATEGORIES = {
	'Anchors': [
		'anchor_tap_2f', 'anchor_swipe_up_2f', 'anchor_swipe_down_2f', 'anchor_swipe_left_2f', 'anchor_swipe_right_2f'
	],
	'Chords': [
		'chord_down_left_2f', 'chord_down_right_2f', 'chord_down_tap_2f', 'chord_down_up_2f',
		'chord_left_right_2f', 'chord_left_tap_2f', 'chord_left_up_2f',
		'chord_right_tap_2f', 'chord_right_up_2f',
		'chord_tap_up_2f'
	],
	'Taps': [
		'tap', 'double_tap', 'triple_tap', 'long_tap'
	],
	'Spatial Taps': [
		'Double_tap_spatial_any', 'Double_tap_spatial_up', 'Double_tap_spatial_down',
		'Double_tap_spatial_left', 'Double_tap_spatial_right', 'Double_tap_spatial_nw',
		'Double_tap_spatial_ne', 'Double_tap_spatial_sw', 'Double_tap_spatial_se',
		'triple_tap_spatial_line_any', 'triple_tap_spatial_line_up', 'triple_tap_spatial_line_down',
		'triple_tap_spatial_line_left', 'triple_tap_spatial_line_right', 'triple_tap_spatial_corner_ne',
		'triple_tap_spatial_corner_nw', 'triple_tap_spatial_corner_se', 'triple_tap_spatial_corner_sw',
		'triple_tap_spatial_corner_en', 'triple_tap_spatial_corner_wn', 'triple_tap_spatial_corner_es',
		'triple_tap_spatial_corner_ws', 'triple_tap_spatial_boomerang_any', 'triple_tap_spatial_boomerang_up',
		'triple_tap_spatial_boomerang_down', 'triple_tap_spatial_boomerang_left', 'triple_tap_spatial_boomerang_right'
	],
	'Multi-Finger Taps': [
		'tap_2f', 'tap_2f_vertical', 'tap_2f_horizontal', 'tap_2f_diagonal_se', 'tap_2f_diagonal_sw',
		'double_tap_2f', 'double_tap_2f_vertical', 'double_tap_2f_horizontal', 'double_tap_2f_diagonal_se', 'double_tap_2f_diagonal_sw',
		'triple_tap_2f', 'triple_tap_2f_vertical', 'triple_tap_2f_horizontal', 'triple_tap_2f_diagonal_se', 'triple_tap_2f_diagonal_sw',
		'long_tap_2f', 'long_tap_2f_vertical', 'long_tap_2f_horizontal', 'long_tap_2f_diagonal_se', 'long_tap_2f_diagonal_sw',
		'tap_3f', 'tap_3f_vertical', 'tap_3f_horizontal', 'tap_3f_diagonal_se', 'tap_3f_diagonal_sw',
		'double_tap_3f', 'double_tap_3f_vertical', 'double_tap_3f_horizontal', 'double_tap_3f_diagonal_se', 'double_tap_3f_diagonal_sw',
		'triple_tap_3f', 'triple_tap_3f_vertical', 'triple_tap_3f_horizontal', 'triple_tap_3f_diagonal_se', 'triple_tap_3f_diagonal_sw',
		'long_tap_3f', 'long_tap_3f_vertical', 'long_tap_3f_horizontal', 'long_tap_3f_diagonal_se', 'long_tap_3f_diagonal_sw'
	],
	'Swipes': [
		'swipe_any', 'swipe_up', 'swipe_down', 'swipe_left', 'swipe_right', 'swipe_nw', 'swipe_ne', 'swipe_sw', 'swipe_se'
	],
	'Long Swipes': [
		'swipe_long_any', 'swipe_long_up', 'swipe_long_down', 'swipe_long_left', 'swipe_long_right', 'swipe_long_nw', 'swipe_long_ne', 'swipe_long_sw', 'swipe_long_se'
	],
	'Multi-Finger Swipes': [
		'swipe_any_2f', 'swipe_up_2f', 'swipe_down_2f', 'swipe_left_2f', 'swipe_right_2f', 'swipe_nw_2f', 'swipe_ne_2f', 'swipe_sw_2f', 'swipe_se_2f',
		'swipe_any_3f', 'swipe_up_3f', 'swipe_down_3f', 'swipe_left_3f', 'swipe_right_3f', 'swipe_nw_3f', 'swipe_ne_3f', 'swipe_sw_3f', 'swipe_se_3f',
		'pinch_swipe_any_2f', 'pinch_swipe_up_2f', 'pinch_swipe_down_2f', 'pinch_swipe_left_2f', 'pinch_swipe_right_2f',
		'expand_swipe_any_2f', 'expand_swipe_up_2f', 'expand_swipe_down_2f', 'expand_swipe_left_2f', 'expand_swipe_right_2f'
	],
	'Boomerangs': [
		'boomerang_any', 'boomerang_up', 'boomerang_down', 'boomerang_left', 'boomerang_right', 'boomerang_nw', 'boomerang_ne', 'boomerang_sw', 'boomerang_se',
		'boomerang_any_2f', 'boomerang_up_2f', 'boomerang_down_2f', 'boomerang_left_2f', 'boomerang_right_2f',
		'boomerang_any_3f', 'boomerang_up_3f', 'boomerang_down_3f', 'boomerang_left_3f', 'boomerang_right_3f',
		'long_boomerang_any', 'long_boomerang_up', 'long_boomerang_down', 'long_boomerang_left', 'long_boomerang_right',
		'long_boomerang_any_2f', 'long_boomerang_up_2f', 'long_boomerang_down_2f', 'long_boomerang_left_2f', 'long_boomerang_right_2f'
	],
	'Switchbacks': [
		'switchback_any', 'switchback_any_cw', 'switchback_any_ccw',
		'switchback_up_cw', 'switchback_down_cw', 'switchback_left_cw', 'switchback_right_cw', 'switchback_nw_cw', 'switchback_ne_cw', 'switchback_sw_cw', 'switchback_se_cw',
		'switchback_up_ccw', 'switchback_down_ccw', 'switchback_left_ccw', 'switchback_right_ccw', 'switchback_nw_ccw', 'switchback_ne_ccw', 'switchback_sw_ccw', 'switchback_se_ccw'
	],
	'Zigzags': [
		'zigzag_any', 'zigzag_any_cw', 'zigzag_any_ccw',
		'zigzag_up_cw', 'zigzag_down_cw', 'zigzag_left_cw', 'zigzag_right_cw', 'zigzag_nw_cw', 'zigzag_ne_cw', 'zigzag_sw_cw', 'zigzag_se_cw',
		'zigzag_up_ccw', 'zigzag_down_ccw', 'zigzag_left_ccw', 'zigzag_right_ccw', 'zigzag_nw_ccw', 'zigzag_ne_ccw', 'zigzag_sw_ccw', 'zigzag_se_ccw'
	],
	'Corners & Shapes': [
		'corner_any', 'corner_cw', 'corner_ccw', 'corner_up_cw', 'corner_right_cw', 'corner_down_cw', 'corner_left_cw', 'corner_up_ccw', 'corner_left_ccw', 'corner_down_ccw', 'corner_right_ccw',
		'triangle_any', 'triangle_cw', 'triangle_ccw', 'triangle_up_cw', 'triangle_right_cw', 'triangle_down_cw', 'triangle_left_cw', 'triangle_up_ccw', 'triangle_left_ccw', 'triangle_down_ccw', 'triangle_right_ccw',
		'u_shape_any', 'u_shape_cw', 'u_shape_ccw', 'u_shape_up_cw', 'u_shape_right_cw', 'u_shape_down_cw', 'u_shape_left_cw', 'u_shape_up_ccw', 'u_shape_left_ccw', 'u_shape_down_ccw', 'u_shape_right_ccw',
		'square_any', 'square_cw', 'square_ccw', 'square_up_cw', 'square_right_cw', 'square_down_cw', 'square_left_cw', 'square_up_ccw', 'square_left_ccw', 'square_down_ccw', 'square_right_ccw'
	],
	'Motion Gestures': [
		'motion_tap_swipe_any', 'motion_tap_swipe_up', 'motion_tap_swipe_down', 'motion_tap_swipe_left', 'motion_tap_swipe_right', 'motion_tap_swipe_nw', 'motion_tap_swipe_ne', 'motion_tap_swipe_sw', 'motion_tap_swipe_se',
		'motion_tap_swipe_long_any', 'motion_tap_swipe_long_up', 'motion_tap_swipe_long_down', 'motion_tap_swipe_long_left', 'motion_tap_swipe_long_right', 'motion_tap_swipe_long_nw', 'motion_tap_swipe_long_ne', 'motion_tap_swipe_long_sw', 'motion_tap_swipe_long_se',
		'motion_tap_boomerang_any', 'motion_tap_boomerang_up', 'motion_tap_boomerang_down', 'motion_tap_boomerang_left', 'motion_tap_boomerang_right', 'motion_tap_boomerang_nw', 'motion_tap_boomerang_ne', 'motion_tap_boomerang_sw', 'motion_tap_boomerang_se',
		'motion_tap_corner_any', 'motion_tap_corner_cw', 'motion_tap_corner_ccw', 'motion_tap_corner_up_cw', 'motion_tap_corner_right_cw', 'motion_tap_corner_left_cw', 'motion_tap_corner_down_cw', 'motion_tap_corner_up_ccw', 'motion_tap_corner_right_ccw', 'motion_tap_corner_left_ccw', 'motion_tap_corner_down_ccw'
	],
	'Flicks': [
		'Flick_any', 'Flick_up', 'Flick_down', 'Flick_left', 'Flick_right', 'Flick_nw', 'Flick_ne', 'Flick_sw', 'Flick_se'
	],
	'Pausing Curves': [
		'Pausing_swipe_any', 'Pausing_swipe_up', 'Pausing_swipe_down', 'Pausing_swipe_left', 'Pausing_swipe_right', 'Pausing_swipe_nw', 'Pausing_swipe_ne', 'Pausing_swipe_sw', 'Pausing_swipe_se',
		'Pausing_boomerang_any', 'Pausing_boomerang_up', 'Pausing_boomerang_down', 'Pausing_boomerang_left', 'Pausing_boomerang_right', 'Pausing_boomerang_nw', 'Pausing_boomerang_ne', 'Pausing_boomerang_sw', 'Pausing_boomerang_se',
		'Pausing_Switchback_any', 'Pausing_Switchback_cw', 'Pausing_Switchback_ccw', 'Pausing_Switchback_up_cw', 'Pausing_Switchback_down_cw', 'Pausing_Switchback_left_cw', 'Pausing_Switchback_right_cw', 'Pausing_Switchback_nw_cw', 'Pausing_Switchback_ne_cw', 'Pausing_Switchback_sw_cw', 'Pausing_Switchback_se_cw', 'Pausing_Switchback_up_ccw', 'Pausing_Switchback_down_ccw', 'Pausing_Switchback_left_ccw', 'Pausing_Switchback_right_ccw', 'Pausing_Switchback_nw_ccw', 'Pausing_Switchback_ne_ccw', 'Pausing_Switchback_sw_ccw', 'Pausing_Switchback_se_ccw',
		'Pausing_corner_any', 'Pausing_corner_cw', 'Pausing_corner_ccw', 'Pausing_corner_up_cw', 'Pausing_corner_right_cw', 'Pausing_corner_down_cw', 'Pausing_corner_left_cw', 'Pausing_corner_up_ccw', 'Pausing_corner_left_ccw', 'Pausing_corner_down_ccw', 'Pausing_corner_right_ccw'
	]
};
const GESTURE_PRESETS = {
	'9_taps': {
		name: "Basic Taps",
		type: 'key9',
		map: {
			'k9_1': 'tap', 'k9_2': 'double_tap', 'k9_3': 'triple_tap',
			'k9_4': 'tap_2f', 'k9_5': 'double_tap_2f', 'k9_6': 'triple_tap_2f',
			'k9_7': 'tap_3f', 'k9_8': 'double_tap_3f', 'k9_9': 'triple_tap_3f'
		}
	},
	'9_spatial': {
		name: "Spatial Taps (3x3 Grid)",
		type: 'key9',
		map: {
			'k9_1': 'Double_tap_spatial_nw', 'k9_2': 'Double_tap_spatial_up', 'k9_3': 'Double_tap_spatial_ne',
			'k9_4': 'Double_tap_spatial_left', 'k9_5': 'double_tap', 'k9_6': 'Double_tap_spatial_right',
			'k9_7': 'Double_tap_spatial_sw', 'k9_8': 'Double_tap_spatial_down', 'k9_9': 'Double_tap_spatial_se'
		}
	},
	'9_swipes': {
		name: "Swipes",
		type: 'key9',
		map: {
			'k9_1': 'swipe_nw', 'k9_2': 'swipe_up', 'k9_3': 'swipe_ne',
			'k9_4': 'swipe_left', 'k9_5': 'double_tap', 'k9_6': 'swipe_right',
			'k9_7': 'swipe_sw', 'k9_8': 'swipe_down', 'k9_9': 'swipe_se'
		}
	},
	'12_taps': {
		name: "Basic Taps",
		type: 'key12',
		map: {
			'k12_1': 'tap', 'k12_2': 'double_tap', 'k12_3': 'triple_tap', 'k12_4': 'long_tap',
			'k12_5': 'tap_2f', 'k12_6': 'double_tap_2f', 'k12_7': 'triple_tap_2f', 'k12_8': 'long_tap_2f',
			'k12_9': 'tap_3f', 'k12_10': 'double_tap_3f', 'k12_11': 'triple_tap_3f', 'k12_12': 'long_tap_3f'
		}
	},
	'12_swipes': {
		name: "Directional Swipes",
		type: 'key12',
		map: {
			'k12_1': 'swipe_up', 'k12_2': 'swipe_down', 'k12_3': 'swipe_left', 'k12_4': 'swipe_right',
			'k12_5': 'swipe_up_2f', 'k12_6': 'swipe_down_2f', 'k12_7': 'swipe_left_2f', 'k12_8': 'swipe_right_2f',
			'k12_9': 'swipe_up_3f', 'k12_10': 'swipe_down_3f', 'k12_11': 'swipe_left_3f', 'k12_12': 'swipe_right_3f'
		}
	},
	'12_flicks': {
		name: "Flicks",
		type: 'key12',
		map: {
			'k12_1': 'Flick_up', 'k12_2': 'Flick_down', 'k12_3': 'Flick_left', 'k12_4': 'Flick_right',
			'k12_5': 'Flick_nw', 'k12_6': 'Flick_ne', 'k12_7': 'Flick_sw', 'k12_8': 'Flick_se',
			'k12_9': 'tap_2f', 'k12_10': 'double_tap_2f', 'k12_11': 'tap_3f', 'k12_12': 'double_tap_3f'
		}
	},
	'piano_taps': {
		name: "Basic Swipes",
		type: 'piano',
		map: {
			'piano_C': 'swipe_nw', 'piano_D': 'swipe_left', 'piano_E': 'swipe_sw', 'piano_F': 'swipe_down',
			'piano_G': 'swipe_se', 'piano_A': 'swipe_right', 'piano_B': 'swipe_ne',
			'piano_1': 'swipe_left_2f', 'piano_2': 'swipe_nw_2f', 'piano_3': 'swipe_up_2f',
			'piano_4': 'swipe_ne_2f', 'piano_5': 'swipe_right_2f'
		}
	},
	'piano_spatial': {
		name: "Spatial Corners",
		type: 'piano',
		map: {
			'piano_C': 'triple_tap_spatial_corner_nw', 'piano_D': 'triple_tap_spatial_line_left',
			'piano_E': 'triple_tap_spatial_corner_sw', 'piano_F': 'triple_tap_spatial_line_down',
			'piano_G': 'triple_tap_spatial_corner_se', 'piano_A': 'triple_tap_spatial_line_right',
			'piano_B': 'triple_tap_spatial_corner_ne',
			'piano_1': 'Double_tap_spatial_left', 'piano_2': 'Double_tap_spatial_nw',
			'piano_3': 'Double_tap_spatial_up', 'piano_4': 'Double_tap_spatial_ne', 'piano_5': 'Double_tap_spatial_right'
		}
	},
	'piano_multi': {
		name: "Multi-Finger",
		type: 'piano',
		map: {
			'piano_C': 'tap_2f', 'piano_D': 'double_tap_2f', 'piano_E': 'triple_tap_2f', 'piano_F': 'long_tap_2f',
			'piano_G': 'tap_3f', 'piano_A': 'double_tap_3f', 'piano_B': 'triple_tap_3f',
			'piano_1': 'swipe_up_2f', 'piano_2': 'swipe_down_2f', 'piano_3': 'swipe_left_2f',
			'piano_4': 'swipe_right_2f', 'piano_5': 'long_tap_3f'
		}
	}
};
const CRAYONS = ["#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", "#B0B7C6", "#AF4035", "#F5F5F5", "#FEFEFA", "#FFFAFA", "#F0F8FF", "#F8F8FF", "#F5F5DC", "#FFFACD", "#FAFAD2", "#FFFFE0", "#FFFFF0", "#FFFF00", "#FFEFD5", "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", "#BDB76B", "#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC", "#8B008B", "#800000", "#4B0082", "#483D8B", "#6A5ACD", "#7B68EE", "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#AFEEEE", "#7FFFD4", "#B0E0E6", "#5F9EA0", "#4682B4", "#6495ED", "#00BFFF", "#1E90FF", "#ADD8E6", "#87CEEB", "#87CEFA", "#191970", "#000080", "#0000FF", "#0000CD", "#4169E1", "#8A2BE2", "#4B0082", "#FFE4C4", "#FFEBCD", "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#F4A460", "#DAA520", "#B8860B", "#CD853F", "#D2691E", "#8B4513", "#A0522D", "#A52A2A", "#800000", "#FFA07A", "#FA8072", "#E9967A", "#F08080", "#CD5C5C", "#DC143C", "#B22222", "#FF0000", "#FF4500", "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#FFFF00", "#808000", "#556B2F", "#6B8E23", "#999999", "#808080", "#666666", "#333333", "#222222", "#111111", "#0A0A0A", "#000000"];
export class SettingsManager {
	formatGestureLabel(id) {
		const compass = { up: 'Up', down: 'Down', left: 'Left', right: 'Right', nw: 'NW', ne: 'NE', sw: 'SW', se: 'SE', cw: 'CW', ccw: 'CCW', any: 'Any' };
		return id.split('_').map(part => {
				if (part === '2f') return '(2-Finger)';
				if (part === '3f') return '(3-Finger)';
				const lower = part.toLowerCase();
				if (compass[lower]) return compass[lower];
				return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
			}).join(' ');
	}
	applyTouchGestureOptions() {
		if (!this.appSettings.activeGestureFilters) {
			this.appSettings.activeGestureFilters = ['Poses', 'Pinches', 'Counts', 'Shapes', 'Motion', 'Transitions', 'Combos', ...Object.keys(GESTURE_CATEGORIES)];
		}
		const active = this.appSettings.activeGestureFilters;
		let optionsHTML = '<option value="none">🚫 Unassigned</option>';
		Object.keys(GESTURE_CATEGORIES).forEach(category => {
				if (!active.includes(category)) return;
				optionsHTML += `<optgroup label="${category}">`;
				GESTURE_CATEGORIES[category].forEach(id => {
						optionsHTML += `<option value="${id}">${this.formatGestureLabel(id)}</option>`;
					});
				optionsHTML += `</optgroup>`;
			});
		document.querySelectorAll('select[id^="map-touch-"]').forEach(select => {
				const currentValue = select.value;
				select.innerHTML = optionsHTML;
				const stillValid = Array.from(select.options).some(o => o.value === currentValue);
				if (stillValid) {
					select.value = currentValue;
				} else if (currentValue && currentValue !== 'none') {
					const opt = document.createElement('option');
					opt.value = currentValue;
					opt.textContent = this.formatGestureLabel(currentValue) + ' (filtered)';
					select.appendChild(opt);
					select.value = currentValue;
				} else {
					select.value = 'none';
				}
			});
	}
	bindGestureFilters() {
		if (!this.dom.filterToggles) return;
		this.dom.filterToggles.forEach(toggle => {
				toggle.addEventListener('change', () => {
						if (!this.appSettings.activeGestureFilters) {
							this.appSettings.activeGestureFilters = ['Poses', 'Pinches', 'Counts', 'Shapes', 'Motion', 'Transitions', 'Combos', ...Object.keys(GESTURE_CATEGORIES)];
						}
						const group = toggle.dataset.group;
						if (toggle.checked) {
							if (!this.appSettings.activeGestureFilters.includes(group)) {
								this.appSettings.activeGestureFilters.push(group);
							}
						} else {
							this.appSettings.activeGestureFilters = this.appSettings.activeGestureFilters.filter(g => g !== group);
						}
						this.applyHandGestureFilters();
						this.applyTouchGestureOptions();
						this.callbacks.onSave();
					});
			});
	}
	applyHandGestureFilters() {
		if (!this.appSettings.activeGestureFilters) {
			this.appSettings.activeGestureFilters = ['Poses', 'Pinches', 'Counts', 'Shapes', 'Motion', 'Transitions', 'Combos', ...Object.keys(GESTURE_CATEGORIES)];
		}
		const active = this.appSettings.activeGestureFilters;
		const groupIdByFilter = { 'Poses': 'hand_poses', 'Pinches': 'hand_pinches', 'Counts': 'hand_counts', 'Shapes': 'hand_vision_shapes', 'Motion': 'hand_swipes', 'Transitions': 'hand_transitions', 'Combos': 'hand_combos' };
		let options = [];
		active.forEach(filterName => {
				const group = HAND_GESTURE_GROUPS.find(g => g.id === groupIdByFilter[filterName]);
				if (group) options.push(...group.gestures);
			});
		const HAND_SIGNAL_IDS = [];
		options = options.filter(g => !HAND_SIGNAL_IDS.includes(String(g.id)));
		const optionsHTML = '<option value="none">🚫 Unassigned</option>' +
		options.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
		document.querySelectorAll('select[id^="map-hand-"]').forEach(select => {
				const currentValue = select.value;
				select.innerHTML = optionsHTML;
				const stillValid = Array.from(select.options).some(o => o.value === currentValue);
				select.value = stillValid ? currentValue : 'none';
			});
	}
	constructor(appSettings, callbacks) {
		this.appSettings = appSettings;
		this.callbacks = callbacks;
		this.currentTargetKey = 'bubble';
		this.dom = {
			editorModal: document.getElementById('theme-editor-modal'), editorGrid: document.getElementById('color-grid'), ftContainer: document.getElementById('fine-tune-container'), ftToggle: document.getElementById('toggle-fine-tune'), ftPreview: document.getElementById('fine-tune-preview'), ftHue: document.getElementById('ft-hue'), ftSat: document.getElementById('ft-sat'), ftLit: document.getElementById('ft-lit'),
			targetBtns: document.querySelectorAll('.target-btn'), edName: document.getElementById('theme-name-input'), edPreview: document.getElementById('theme-preview-box'), edPreviewBtn: document.getElementById('preview-btn'), edPreviewCard: document.getElementById('preview-card'), edSave: document.getElementById('save-theme-btn'), edCancel: document.getElementById('cancel-theme-btn'),
			openEditorBtn: document.getElementById('open-theme-editor'),
			filterToggles: document.querySelectorAll('.gesture-filter-toggle'),
			toneCadenceToggle: document.getElementById('toneToggle'),
			headertonebtn: document.getElementById('headertonebtn'),
			headerfullscreenbtn: document.getElementById('headerfullscreenbtn'),
			headerupsidedownbtn: document.getElementById('headerupsidedownbtn'),
			voicePresetSelect: document.getElementById('voice-preset-select'),
			voicePresetAdd: document.getElementById('voice-preset-add'),
			voicePresetSave: document.getElementById('voice-preset-save'),
			voicePresetRename: document.getElementById('voice-preset-rename'),
			voicePresetDelete: document.getElementById('voice-preset-delete'),
			voicePitch: document.getElementById('voice-pitch'), voiceRate: document.getElementById('voice-rate'), voiceVolume: document.getElementById('voice-volume'), voiceTestBtn: document.getElementById('test-voice-btn'), voiceNameSelect: document.getElementById('voice-name-select'),
			settingsModal: document.getElementById('settings-modal'), themeSelect: document.getElementById('theme-select'), themeAdd: document.getElementById('theme-add'), themeRename: document.getElementById('theme-rename'), themeDelete: document.getElementById('theme-delete'), themeSave: document.getElementById('theme-save'), randomThemeToggle: document.getElementById('randomThemeToggle'), skeletonDebugToggle: document.getElementById('skeletonDebugToggle'), fontSelect: document.getElementById('font-select'),
			configSelect: document.getElementById('config-select'), quickConfigSelect: document.getElementById('quick-config-select'), configAdd: document.getElementById('config-add'), configRename: document.getElementById('config-rename'), configDelete: document.getElementById('config-delete'), configSave: document.getElementById('config-save'),
			input: document.getElementById('input-select'), mode: document.getElementById('mode-select'), practiceMode: document.getElementById('practice-mode-toggle'), machines: document.getElementById('machines-select'), seqLength: document.getElementById('seq-length-select'),
			autoClear: document.getElementById('autoclear-toggle'), autoplay: document.getElementById('autoplay-toggle'), flash: document.getElementById('flash-toggle'),
			pause: document.getElementById('pause-select'), audio: document.getElementById('audio-toggle'), hapticMorse: document.getElementById('haptic-morse-toggle'), playbackSpeed: document.getElementById('playback-speed-select'), chunk: document.getElementById('chunk-select'), delay: document.getElementById('delay-select'), haptics: document.getElementById('hapticsToggle'),
			speedGesturesToggle: document.getElementById('speedToggle'),
			volumeGesturesToggle: document.getElementById('volgesToggle'),
			deleteGestureToggle: document.getElementById('deleteToggle'),
			clearGestureToggle: document.getElementById('clearToggle'),
			autoTimerToggle: document.getElementById('autotimerToggle'),
			autoCounterToggle: document.getElementById('autocounterToggle'),
			arcamToggle: document.getElementById('arcamToggle'),
			arAutoCloseGeneralToggle: document.getElementById('arAutoCloseGeneralToggle'),
			arAutoClosePlayback: document.getElementById('ar-autoclose-toggle'),
			voiceToggle: document.getElementById('voiceToggle'),
			speedDelete: document.getElementById('speeddeleteToggle'),
			showWelcome: document.getElementById('introToggle'),
			bossToggle: document.getElementById('bossToggle'),
			biggerToggle: document.getElementById('biggerToggle'),
			longPressToggle: document.getElementById('apshortcutToggle'),
			timerToggle: document.getElementById('timerToggle'),
			counterToggle: document.getElementById('counterToggle'),
			gestureToggle: document.getElementById('touchToggle'),
			handToggle: document.getElementById('handToggle'),
			handsignalsToggle: document.getElementById('handsignalsToggle'),
			voicecommandsToggle: document.getElementById('voicecommandsToggle'),
			wakelockToggle: document.getElementById('wakelockToggle'),
			newToggle: document.getElementById('newToggle'),
			headerswapbtn: document.getElementById('headerswapbtn'),
			uiScale: document.getElementById('ui-scale-select'),
			seqSize: document.getElementById('seq-size-select'),
			seqFontSize: document.getElementById('seq-font-size-select'),
			gestureMode: document.getElementById('gesture-mode-select'),
			closeSettingsBtn: document.getElementById('close-settings'),
			tabs: document.querySelectorAll('.tab-btn'),
			contents: document.querySelectorAll('.tab-content'),
			helpModal: document.getElementById('help-modal'), setupModal: document.getElementById('game-setup-modal'), shareModal: document.getElementById('share-modal'), closeSetupBtn: document.getElementById('close-game-setup-modal'), quickSettings: document.getElementById('quick-open-settings'), quickHelp: document.getElementById('quick-open-help'),
			quickAutoplay: document.getElementById('quick-autoplay-toggle'), quickAudio: document.getElementById('quick-audio-toggle'), dontShowWelcome: document.getElementById('dont-introToggle'),
			quickResizeUp: document.getElementById('quick-resize-up'), quickResizeDown: document.getElementById('quick-resize-down'),
			openShareInside: document.getElementById('open-share-button'), closeShareBtn: document.getElementById('close-share'), closeHelpBtn: document.getElementById('close-help'), closeHelpBtnBottom: document.getElementById('close-help-btn-bottom'), openHelpBtn: document.getElementById('open-help-button'), promptDisplay: document.getElementById('prompt-display'), copyPromptBtn: document.getElementById('copy-prompt-btn'), generatePromptBtn: document.getElementById('generate-prompt-btn'),
			developerModeModal: document.getElementById('developer-mode-modal'), openDeveloperModeBtn: document.getElementById('open-developer-mode-btn'), closeDeveloperModeBtn: document.getElementById('close-developer-mode-btn'),
			restoreBtn: document.querySelector('button[data-action="restore-defaults"]'),
			nukeBtn: document.querySelector('button[data-action="nuke-app"]'),
			redeemModal: document.getElementById('redeem-modal'),
			closeRedeemBtn: document.getElementById('close-redeem-btn'),
			redeemImg: document.getElementById('redeem-img'),
			qrImg: document.getElementById('qr-img'), qrZoomIn: document.getElementById('qr-zoom-in'), qrZoomOut: document.getElementById('qr-zoom-out'),
			redeemPlus: document.getElementById('redeem-zoom-in'),
			redeemMinus: document.getElementById('redeem-zoom-out'),
			openDonateBtn: document.getElementById('open-donate-btn'),
			openRedeemSettingsBtn: document.getElementById('open-redeem-btn-settings'),
			donateModal: document.getElementById('donate-modal'), closeDonateBtn: document.getElementById('close-donate-btn'),
			btnCashMain: document.getElementById('btn-cashapp-main'), btnPaypalMain: document.getElementById('btn-paypal-main'),
			copyLinkBtn: document.getElementById('copy-link-button'), nativeShareBtn: document.getElementById('native-share-button'),
			chatShareBtn: document.getElementById('chat-share-button'), emailShareBtn: document.getElementById('email-share-button'),
			gestureTapSlider: document.getElementById('gesture-tap-slider'),
			gestureSwipeSlider: document.getElementById('gesture-swipe-slider'),
			gestureTapVal: document.getElementById('gesture-tap-val'),
			gestureSwipeVal: document.getElementById('gesture-swipe-val'),
			voiceTriggerSelect: document.getElementById('voice-trigger-select'),
			upsidedownToggle: document.getElementById('upsidedownToggle'),
			fullscreenToggle: document.getElementById('fullscreenToggle'),
			ecoToggle: document.getElementById('ecoToggle'),
			arSpeedSelect: document.getElementById('ar-speed-select')
		};
		this.tempTheme = null;
		this.initListeners();
		this.bindGestureFilters();
		this.applyHandGestureFilters();
		this.applyTouchGestureOptions();
		this.populateConfigDropdown();
		this.populateThemeDropdown();
		this.buildColorGrid();
		this.populateVoicePresetDropdown();
		this.populateVoiceNameDropdown();
		if (window.speechSynthesis) {
			window.speechSynthesis.onvoiceschanged = () => this.populateVoiceNameDropdown();
		}
		this.populatePlaybackSpeedDropdown();
		this.populateARSpeedDropdown();
		this.populateUIScaleDropdown();
		this.populateMappingUI();
		this.populateMorseUI();
		this.updateUIFromSettings();
		if(this.dom.gestureToggle){
			this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
			this.dom.gestureToggle.addEventListener('change', (e) => {
					this.appSettings.isGestureInputEnabled = !!e.target.checked;
					this.callbacks.onSave();
					this.updateHeaderVisibility();
					this.callbacks.onSettingsChanged && this.callbacks.onSettingsChanged();
				});
		}
		const bindToggle = (toggleElement, settingKey, applyCallback) => {
			if (toggleElement) {
				let defaultState = settingKey === 'isWakeLockEnabled' ? true : false;
				toggleElement.checked = this.appSettings[settingKey] ?? defaultState;
				toggleElement.onchange = (e) => {
					this.appSettings[settingKey] = e.target.checked;
					this.callbacks.onSave();
					if (applyCallback) applyCallback();
				};
			}
		};
		bindToggle(this.dom.wakelockToggle, 'isWakeLockEnabled', () => {
				if (typeof window.wakelockToggle === 'function') {
					window.wakelockToggle(this.appSettings.isWakeLockEnabled);
				}
			});
		if (this.dom.fullscreenToggle) {
			this.dom.fullscreenToggle.onchange = (e) => {
				this.appSettings.showFullscreenBtn = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		if (this.dom.upsidedownToggle) {
			this.dom.upsidedownToggle.onchange = (e) => {
				this.appSettings.showUpsideDownBtn = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		bindToggle(this.dom.ecoToggle, 'isEcoModeEnabled', () => {
				document.body.classList.toggle('eco-mode', this.appSettings.isEcoModeEnabled);
			});
		if (this.dom.arSpeedSelect) {
			this.dom.arSpeedSelect.value = this.appSettings.arPlaybackSpeed || 1.0;
			this.dom.arSpeedSelect.onchange = (e) => {
				this.appSettings.arPlaybackSpeed = parseFloat(e.target.value);
				this.callbacks.onSave();
			};
		}
	}
	bindMappingEvents() {
		const btnMapTouch = document.getElementById('btn-map-touch');
		const btnMapHand = document.getElementById('btn-map-hand');
		const sectionMapTouch = document.getElementById('section-map-touch');
		const sectionMapHand = document.getElementById('section-map-hand');
		if (btnMapTouch && btnMapHand && sectionMapTouch && sectionMapHand) {
			btnMapTouch.onclick = () => {
				btnMapTouch.classList.add('text-blue-400', 'border-b-2', 'border-blue-400');
				btnMapTouch.classList.remove('text-gray-500');
				btnMapHand.classList.remove('text-emerald-400', 'border-b-2', 'border-emerald-400');
				btnMapHand.classList.add('text-gray-500');
				sectionMapTouch.classList.remove('hidden');
				sectionMapHand.classList.add('hidden');
			};
			btnMapHand.onclick = () => {
				btnMapHand.classList.add('text-emerald-400', 'border-b-2', 'border-emerald-400');
				btnMapHand.classList.remove('text-gray-500');
				btnMapTouch.classList.remove('text-blue-400', 'border-b-2', 'border-blue-400');
				btnMapTouch.classList.add('text-gray-500');
				sectionMapHand.classList.remove('hidden');
				sectionMapTouch.classList.add('hidden');
			};
		}
		const LAYOUT_KEYS = {
			key9: Array.from({ length: 9 }, (_, i) => `k9_${i + 1}`),
			key12: Array.from({ length: 12 }, (_, i) => `k12_${i + 1}`),
			piano: ['piano_C', 'piano_D', 'piano_E', 'piano_F', 'piano_G', 'piano_A', 'piano_B', 'piano_1', 'piano_2', 'piano_3', 'piano_4', 'piano_5']
		};
		const filterPresetsByType = (presetsObj, type) => {
			const out = {};
			Object.keys(presetsObj).forEach(id => { if (presetsObj[id].type === type) out[id] = presetsObj[id]; });
			return out;
		};
		['key9', 'key12', 'piano'].forEach(layout => {
				this.bindPresetAccordion('touch', layout, filterPresetsByType(GESTURE_PRESETS, layout), LAYOUT_KEYS[layout],
					(key) => (this.appSettings.gestureMappings && this.appSettings.gestureMappings[key]) ? this.appSettings.gestureMappings[key].gesture : 'none',
					(key, val) => {
						if (!this.appSettings.gestureMappings) this.appSettings.gestureMappings = {};
						if (!this.appSettings.gestureMappings[key]) this.appSettings.gestureMappings[key] = {};
						this.appSettings.gestureMappings[key].gesture = val;
						const el = document.querySelector(`#map-touch-${key}`);
						if (el) el.value = val;
					});
				this.bindPresetAccordion('hand', layout, filterPresetsByType(HAND_MAPPING_PRESETS, layout), LAYOUT_KEYS[layout],
					(key) => (this.appSettings.mappings && this.appSettings.mappings[key]) ? String(this.appSettings.mappings[key].handGesture) : 'none',
					(key, val) => {
						if (!this.appSettings.mappings) this.appSettings.mappings = {};
						if (!this.appSettings.mappings[key]) this.appSettings.mappings[key] = { touch: 'none', handGesture: 'none', morse: '' };
						this.appSettings.mappings[key].handGesture = val === 'none' ? 'none' : parseInt(val, 10);
						const el = document.querySelector(`#map-hand-${key}`);
						if (el) el.value = val;
					});
			});
		document.querySelectorAll('.mapping-subtab-btn').forEach(tab => {
				tab.onclick = (e) => {
					const keyId = e.target.dataset.key;
					const target = e.target.dataset.target;
					const parent = e.target.closest('details');
					parent.querySelectorAll('.mapping-subtab-btn').forEach(t => {
							t.classList.remove('active', 'text-blue-400', 'text-emerald-400', 'border-b-2', 'border-blue-400', 'border-emerald-400');
							t.classList.add('text-gray-500');
						});
					parent.querySelectorAll('.mapping-panel').forEach(p => p.classList.add('hidden'));
					e.target.classList.remove('text-gray-500');
					if (target === 'touch') {
						e.target.classList.add('active', 'text-blue-400', 'border-b-2', 'border-blue-400');
						parent.querySelector(`#panel-touch-${keyId}`).classList.remove('hidden');
					} else {
						e.target.classList.add('active', 'text-emerald-400', 'border-b-2', 'border-emerald-400');
						parent.querySelector(`#panel-hand-${keyId}`).classList.remove('hidden');
					}
				};
			});
		document.querySelectorAll('.mapping-select').forEach(select => {
				const keyId = select.dataset.key;
				const type = select.dataset.type;
				if (type === 'touch') {
					if (this.appSettings.gestureMappings && this.appSettings.gestureMappings[keyId] && this.appSettings.gestureMappings[keyId].gesture) {
						select.value = this.appSettings.gestureMappings[keyId].gesture;
					}
				} else if (this.appSettings.mappings && this.appSettings.mappings[keyId] && this.appSettings.mappings[keyId].handGesture !== undefined) {
					select.value = this.appSettings.mappings[keyId].handGesture;
				}
				select.onchange = (e) => {
					if (type === 'touch') {
						if (!this.appSettings.gestureMappings) this.appSettings.gestureMappings = {};
						if (!this.appSettings.gestureMappings[keyId]) this.appSettings.gestureMappings[keyId] = {};
						this.appSettings.gestureMappings[keyId].gesture = e.target.value;
					} else {
						if (!this.appSettings.mappings) this.appSettings.mappings = {};
						if (!this.appSettings.mappings[keyId]) this.appSettings.mappings[keyId] = { touch: 'none', handGesture: 'none', morse: '' };
						this.appSettings.mappings[keyId].handGesture = e.target.value === 'none' ? 'none' : parseInt(e.target.value, 10);
					}
					this.callbacks.onSave();
				};
			});
	}
	bindPresetAccordion(gtype, layout, builtInPresets, keys, getCurrentValueFn, applyValueFn) {
		const select = document.getElementById(`${gtype}-preset-${layout}-select`);
		if (!select) return;
		const storeKey = gtype === 'touch' ? 'customTouchPresets' : 'customHandPresets';
		if (!this.appSettings[storeKey]) this.appSettings[storeKey] = {};
		const populate = () => {
			const currentVal = select.value;
			select.innerHTML = '<option value="">-- Select Preset --</option>';
			const builtInGroup = document.createElement('optgroup');
			builtInGroup.label = 'Built-in';
			Object.keys(builtInPresets).forEach(id => {
					const opt = document.createElement('option');
					opt.value = id;
					opt.textContent = builtInPresets[id].name;
					builtInGroup.appendChild(opt);
				});
			select.appendChild(builtInGroup);
			const customGroup = document.createElement('optgroup');
			customGroup.label = 'My Setups';
			Object.keys(this.appSettings[storeKey]).forEach(id => {
					const preset = this.appSettings[storeKey][id];
					if (preset.layout !== layout) return;
					const opt = document.createElement('option');
					opt.value = id;
					opt.textContent = preset.name;
					customGroup.appendChild(opt);
				});
			select.appendChild(customGroup);
			select.value = currentVal;
		};
		populate();
		select.onchange = () => {
			const val = select.value;
			if (!val) return;
			const preset = builtInPresets[val] || this.appSettings[storeKey][val];
			if (!preset) return;
			Object.keys(preset.map).forEach(key => applyValueFn(key, preset.map[key]));
			this.callbacks.onSave();
			if (typeof showToast === 'function') showToast(`Applied: ${preset.name} ⚡`);
		};
		const snapshotCurrentMap = () => {
			const map = {};
			keys.forEach(key => { map[key] = getCurrentValueFn(key); });
			return map;
		};
		const newBtn = document.getElementById(`${gtype}-preset-${layout}-new`);
		const saveBtn = document.getElementById(`${gtype}-preset-${layout}-save`);
		const renameBtn = document.getElementById(`${gtype}-preset-${layout}-rename`);
		const deleteBtn = document.getElementById(`${gtype}-preset-${layout}-delete`);
		if (newBtn) newBtn.onclick = () => {
			const name = prompt('New preset name:');
			if (!name) return;
			const id = 'custom_' + Date.now();
			this.appSettings[storeKey][id] = { name, layout, map: snapshotCurrentMap() };
			this.callbacks.onSave();
			populate();
			select.value = id;
		};
		if (saveBtn) saveBtn.onclick = () => {
			const val = select.value;
			if (!val || !this.appSettings[storeKey][val]) { alert("Select a custom preset to save (or use NEW)."); return; }
			this.appSettings[storeKey][val].map = snapshotCurrentMap();
			this.callbacks.onSave();
			alert("Preset Saved!");
		};
		if (renameBtn) renameBtn.onclick = () => {
			const val = select.value;
			if (!val || !this.appSettings[storeKey][val]) { alert("Cannot rename a built-in preset."); return; }
			const newName = prompt("Rename:", this.appSettings[storeKey][val].name);
			if (newName) {
				this.appSettings[storeKey][val].name = newName;
				this.callbacks.onSave();
				populate();
				select.value = val;
			}
		};
		if (deleteBtn) deleteBtn.onclick = () => {
			const val = select.value;
			if (!val || !this.appSettings[storeKey][val]) { alert("Cannot delete a built-in preset."); return; }
			if (confirm("Delete this preset?")) {
				delete this.appSettings[storeKey][val];
				this.callbacks.onSave();
				populate();
			}
		};
	}
	populatePlaybackSpeedDropdown() {
		if (!this.dom.playbackSpeed) return;
		this.dom.playbackSpeed.innerHTML = '';
		for (let i = 75; i <= 150; i += 5) {
			const opt = document.createElement('option');
			const val = (i / 100).toFixed(2);
			opt.value = val;
			opt.textContent = i + '%';
			this.dom.playbackSpeed.appendChild(opt);
		}
		this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
	}
	populateARSpeedDropdown() {
		if (!this.dom.arSpeedSelect) return;
		this.dom.arSpeedSelect.innerHTML = '';
		const speeds = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
		speeds.forEach(speed => {
				const opt = document.createElement('option');
				opt.value = speed;
				opt.textContent = speed.toFixed(2) + 'x';
				this.dom.arSpeedSelect.appendChild(opt);
			});
		const speedVal = this.appSettings.arPlaybackSpeed || 1.0;
		this.dom.arSpeedSelect.value = String(speedVal);
	}
	populateUIScaleDropdown() {
		if (!this.dom.uiScale) return;
		this.dom.uiScale.innerHTML = '';
		for (let i = 50; i <= 500; i += 10) {
			const opt = document.createElement('option');
			opt.value = i;
			opt.textContent = i + '%';
			this.dom.uiScale.appendChild(opt);
		}
		this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
	}
	populateVoicePresetDropdown() {
		if (!this.dom.voicePresetSelect) return;
		this.dom.voicePresetSelect.innerHTML = '';
		const grp1 = document.createElement('optgroup');
		grp1.label = "Built-in";
		Object.keys(PREMADE_VOICE_PRESETS).forEach(k => {
				const el = document.createElement('option');
				el.value = k;
				el.textContent = PREMADE_VOICE_PRESETS[k].name;
				grp1.appendChild(el);
			});
		this.dom.voicePresetSelect.appendChild(grp1);
		const grp2 = document.createElement('optgroup');
		grp2.label = "My Voices";
		if (this.appSettings.voicePresets) {
			Object.keys(this.appSettings.voicePresets).forEach(k => {
					const el = document.createElement('option');
					el.value = k;
					el.textContent = this.appSettings.voicePresets[k].name;
					grp2.appendChild(el);
				});
		}
		this.dom.voicePresetSelect.appendChild(grp2);
		this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
	}
	isHighQualityVoice(voice) {
		const name = voice.name.toLowerCase();
		return /enhanced|premium|natural|neural|online/.test(name) ||
		(name.includes('google') && !name.includes('compact'));
	}
	populateVoiceNameDropdown() {
		if (!this.dom.voiceNameSelect || !window.speechSynthesis) return;
		const voices = window.speechSynthesis.getVoices();
		if (!voices.length) return;
		this.dom.voiceNameSelect.innerHTML = '';
		const def = document.createElement('option');
		def.value = '';
		def.textContent = 'Browser Default';
		this.dom.voiceNameSelect.appendChild(def);
		let bestQualityVoice = null;
		voices.forEach(voice => {
				const opt = document.createElement('option');
				opt.value = voice.name;
				const isHQ = this.isHighQualityVoice(voice);
				opt.textContent = (isHQ ? '⭐ ' : '') + voice.name + ' (' + voice.lang + ')';
				this.dom.voiceNameSelect.appendChild(opt);
				if (isHQ && !bestQualityVoice) bestQualityVoice = voice;
			});
		if (!this.appSettings.selectedVoice && bestQualityVoice) {
			this.appSettings.selectedVoice = bestQualityVoice.name;
			this.callbacks.onSave();
		}
		this.dom.voiceNameSelect.value = this.appSettings.selectedVoice || '';
	}
	applyVoicePreset(id) {
		let preset = this.appSettings.voicePresets[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS['standard'];
		this.appSettings.voicePitch = preset.pitch;
		this.appSettings.voiceRate = preset.rate;
		this.appSettings.voiceVolume = preset.volume;
		this.updateUIFromSettings();
		this.callbacks.onSave();
	}
	buildColorGrid() { if (!this.dom.editorGrid) return; this.dom.editorGrid.innerHTML = ''; CRAYONS.forEach(color => { const btn = document.createElement('div'); btn.style.backgroundColor = color; btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; btn.onclick = () => this.applyColorToTarget(color); this.dom.editorGrid.appendChild(btn); }); }
	applyColorToTarget(hex) { if (!this.tempTheme) return; this.tempTheme[this.currentTargetKey] = hex; const [h, s, l] = this.hexToHsl(hex); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = hex; if (this.dom.ftContainer.classList.contains('hidden')) { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; } this.updatePreview(); }
	updateColorFromSliders() { const h = parseInt(this.dom.ftHue.value); const s = parseInt(this.dom.ftSat.value); const l = parseInt(this.dom.ftLit.value); const hex = this.hslToHex(h, s, l); this.dom.ftPreview.style.backgroundColor = hex; if (this.tempTheme) { this.tempTheme[this.currentTargetKey] = hex; this.updatePreview(); } }
	openThemeEditor() { if (!this.dom.editorModal) return; const activeId = this.appSettings.activeTheme; const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; this.tempTheme = { ...source }; this.dom.edName.value = this.tempTheme.name; this.dom.targetBtns.forEach(b => b.classList.remove('active', 'bg-primary-app')); this.dom.targetBtns[2].classList.add('active', 'bg-primary-app'); this.currentTargetKey = 'bubble'; const [h, s, l] = this.hexToHsl(this.tempTheme.bubble); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = this.tempTheme.bubble; this.updatePreview(); this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.remove('scale-90'); }
	updatePreview() { const t = this.tempTheme; if (!this.dom.edPreview) return; this.dom.edPreview.style.backgroundColor = t.bgMain; this.dom.edPreview.style.color = t.text; this.dom.edPreviewCard.style.backgroundColor = t.bgCard; this.dom.edPreviewCard.style.color = t.text; this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; this.dom.edPreviewBtn.style.backgroundColor = t.bubble; this.dom.edPreviewBtn.style.color = t.text; }
	testVoice() { if (window.speechSynthesis) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance("Testing 1 2 3."); if (this.appSettings.selectedVoice) { const v = window.speechSynthesis.getVoices().find(voice => voice.name === this.appSettings.selectedVoice); if (v) u.voice = v; } let p = parseFloat(this.dom.voicePitch.value); let r = parseFloat(this.dom.voiceRate.value); let v = parseFloat(this.dom.voiceVolume.value); u.pitch = p; u.rate = r; u.volume = v; window.speechSynthesis.speak(u); } }
	openShare() { this.qrScale = 100; if (this.updateQR) this.updateQR(); if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); if (this.dom.shareModal) { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); } if (window.lockBodyScroll) window.lockBodyScroll(); }
	closeShare() { if (this.dom.shareModal) { this.dom.shareModal.querySelector('.share-sheet').classList.remove('active'); setTimeout(() => this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none'), 300); } if (window.unlockBodyScroll) window.unlockBodyScroll(); }
	toggleRedeem(show) { if (show) { if (this.dom.redeemModal) { this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.redeemModal.style.pointerEvents = 'auto'; } if (window.lockBodyScroll) window.lockBodyScroll(); } else { if (this.dom.redeemModal) { this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.redeemModal.style.pointerEvents = 'none'; } if (window.unlockBodyScroll) window.unlockBodyScroll(); } }
	toggleDonate(show) { if (show) { if (this.dom.donateModal) { this.dom.donateModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.donateModal.style.pointerEvents = 'auto'; } if (window.lockBodyScroll) window.lockBodyScroll(); } else { if (this.dom.donateModal) { this.dom.donateModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.donateModal.style.pointerEvents = 'none'; } if (window.unlockBodyScroll) window.unlockBodyScroll(); } }
	setupTabSwipe(modal) {
		const content = modal.querySelector('.settings-modal-bg');
		if (!content) return;
		let startX = 0;
		let startY = 0;
		let isSwipeIgnored = false;
		content.addEventListener('touchstart', (e) => {
				if (e.target.closest('.no-swipe-zone') || e.target.closest('button')) {
					isSwipeIgnored = true;
					return;
				}
				isSwipeIgnored = false;
				startX = e.changedTouches[0].screenX;
				startY = e.changedTouches[0].screenY;
			}, { passive: true });
		content.addEventListener('touchend', (e) => {
				if (isSwipeIgnored) return;
				const endX = e.changedTouches[0].screenX;
				const endY = e.changedTouches[0].screenY;
				const diffX = endX - startX;
				const diffY = endY - startY;
				if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY) * 2) {
					const tabs = Array.from(modal.querySelectorAll('.tab-btn'));
					const activeIdx = tabs.findIndex(t => t.classList.contains('active'));
					if (activeIdx === -1) return;
					if (diffX < 0) {
						if (activeIdx < tabs.length - 1) tabs[activeIdx + 1].click();
					} else {
						if (activeIdx > 0) tabs[activeIdx - 1].click();
					}
				}
			}, { passive: true });
	}
	initListeners() {
		const touchTestContainer = document.getElementById('test-area-lock-container');
		if (touchTestContainer && !window.__testGestureEngine) {
			window.__testGestureEngine = new modules.gestureEngine.constructor(touchTestContainer, {
					tapDelay: appSettings.gestureTapDelay || 300,
					swipeThreshold: appSettings.gestureSwipeDist || 30,
					longPressTime: appSettings.gestureLongPressTime || 300,
					tapPrecision: appSettings.gestureTapPrecision || 30,
					spatialThreshold: appSettings.gestureSpatialThreshold || 10,
					longSwipeThreshold: appSettings.gestureLongSwipeThreshold || 150,
					multiSwipeThreshold: appSettings.gestureMultiSwipeThreshold || 10
				}, {
					onGesture: (data) => {
						const readout = document.getElementById('test-touch-readout');
						if (readout) readout.textContent = data.name || JSON.stringify(data);
					},
					onContinuous: (data) => {
						const readout = document.getElementById('test-touch-readout');
						if (readout) readout.textContent = `${data.type} (Continuous)`;
					}
				});

			// Pass empty array to allow ALL gestures in the test pad
			window.__testGestureEngine.updateAllowed([]);

			// Stop propagation so the global body engine ignores these touches
			touchTestContainer.addEventListener('pointerdown', e => e.stopPropagation());
			touchTestContainer.addEventListener('pointermove', e => e.stopPropagation());
			touchTestContainer.addEventListener('pointerup', e => e.stopPropagation());
		}

		// --- VOICE TEST: Exact matching validation ---
		if (voiceStartBtn) {
			voiceStartBtn.onclick = () => {
				if (testRecognition) { stopVoiceTest(); return; }
				const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
				const readout = document.getElementById('test-voice-readout');
				if (!SR) { if (readout) readout.textContent = 'Speech recognition not supported'; return; }
				testRecognition = new SR();
				testRecognition.continuous = true;
				testRecognition.interimResults = true;

				const vocab = {
					'1': '1', 'one': '1', 'won': '1', '2': '2', 'two': '2', 'to': '2', 'too': '2',
					'3': '3', 'three': '3', 'tree': '3', '4': '4', 'four': '4', 'for': '4', 'fore': '4',
					'5': '5', 'five': '5', '6': '6', 'six': '6', '7': '7', 'seven': '7',
					'8': '8', 'eight': '8', 'ate': '8', '9': '9', 'nine': '9',
					'10': '10', 'ten': '10', 'tin': '10', '11': '11', 'eleven': '11', '12': '12', 'twelve': '12',
					'a': 'A', 'hey': 'A', 'b': 'B', 'bee': 'B', 'be': 'B', 'c': 'C', 'see': 'C', 'sea': 'C',
					'd': 'D', 'dee': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'jee': 'G'
				};
				const commandVocab = {
					'play': 'CMD_PLAY', 'start': 'CMD_PLAY', 'go': 'CMD_PLAY',
					'stop': 'CMD_STOP', 'pause': 'CMD_STOP',
					'clear': 'CMD_CLEAR', 'reset': 'CMD_CLEAR',
					'delete': 'CMD_DELETE', 'backspace': 'CMD_DELETE', 'undo': 'CMD_DELETE', 'back': 'CMD_DELETE',
					'settings': 'CMD_SETTINGS', 'options': 'CMD_SETTINGS'
				};

				testRecognition.onresult = (e) => {
					const last = e.results[e.results.length - 1];
					const transcript = last[0].transcript.toLowerCase().trim();

					if (last.isFinal) {
						const activeTrigger = (window.appSettings.voiceTriggerWord || 'set').toLowerCase();
						const words = transcript.split(/\s+/).filter(w => w !== "");
						const triggerIdx = words.lastIndexOf(activeTrigger);

						let match = null;
						if (triggerIdx !== -1 && triggerIdx < words.length - 1) {
							const nextWord = words[triggerIdx + 1];
							if (commandVocab[nextWord]) match = commandVocab[nextWord];
							else if (vocab[nextWord]) match = vocab[nextWord];
						}

						if (match) {
							if (readout) readout.innerHTML = `<span class="text-green-400 font-bold">✓ Match: ${match}</span> <br><span class="text-gray-500 text-[10px]">from "${transcript}"</span>`;
						} else {
							if (readout) readout.innerHTML = `<span class="text-red-400 font-bold">✗ Ignored</span> <br><span class="text-gray-500 text-[10px]">heard "${transcript}"</span>`;
						}
					} else {
						if (readout) readout.textContent = `listening: "${transcript}"`;
					}
				};
				testRecognition.onerror = (e) => { if (readout) readout.textContent = `Mic error: ${e.error}`; };
				testRecognition.onend = () => { if (testRecognition) { try { testRecognition.start(); } catch (e) {} } };
				testRecognition.start();
				voiceStartBtn.textContent = '⏹️ Stop Mic Test';
				if (readout) readout.textContent = 'Listening...';
			};
		}

		// --- TONE TEST: History clear ---
		const clearToneHistoryBtn = document.getElementById('clear-tone-history-btn');
		if (clearToneHistoryBtn) {
			clearToneHistoryBtn.onclick = () => {
				const historyEl = document.getElementById('tone-test-history');
				if (historyEl) historyEl.textContent = "";
			};
		}
		try {
			const openDevBtn = document.getElementById('open-developer-mode-btn');
			const closeDevBtn = document.getElementById('close-developer-mode-btn');
			const devModal = document.getElementById('developer-mode-modal');
			const settingsModalEl = document.getElementById('settings-modal');
			if (openDevBtn && devModal) {
				openDevBtn.onclick = () => {
					if (!window.__testAreaSetup) {
						window.__testAreaSetup = true;
						let activeTestTab = 'hand';
						const tabButtons = {
							hand: document.getElementById('test-tab-btn-hand'),
							touch: document.getElementById('test-tab-btn-touch'),
							voice: document.getElementById('test-tab-btn-voice'),
							tone: document.getElementById('test-tab-btn-tone'),
						};
						const tabColors = { hand: 'emerald', touch: 'blue', voice: 'yellow', tone: 'purple' };
						const panels = {
							hand: document.getElementById('test-panel-hand'),
							touch: document.getElementById('test-panel-touch'),
							voice: document.getElementById('test-panel-voice'),
							tone: document.getElementById('test-panel-tone'),
						};
						const stopAllTests = () => {
							if (window.__testHandStop) window.__testHandStop();
							if (window.__testVoiceStop) window.__testVoiceStop();
							if (window.__testToneStop) window.__testToneStop();
						};
						const switchTestTab = (tab) => {
							if (tab !== activeTestTab) stopAllTests();
							activeTestTab = tab;
							Object.keys(panels).forEach(key => {
									panels[key]?.classList.toggle('hidden', key !== tab);
									const btn = tabButtons[key];
									if (!btn) return;
									if (key === tab) {
										btn.className = `test-tab-btn py-2 rounded-lg text-[10px] font-bold bg-${tabColors[key]}-600 text-white`;
									} else {
										btn.className = 'test-tab-btn py-2 rounded-lg text-[10px] font-bold bg-gray-700 text-gray-300';
									}
								});
						};
						Object.keys(tabButtons).forEach(key => {
								if (tabButtons[key]) tabButtons[key].onclick = () => switchTestTab(key);
							});
						window.__stopAllDevModeTests = stopAllTests;
						const handStartBtn = document.getElementById('test-hand-start-btn');
						const handPlaceholder = document.getElementById('practice-preview-placeholder');
						const previewVideo = document.getElementById('practice-preview-video');
						let handTestRunning = false;
						const stopHandTest = () => {
							if (!handTestRunning) return;
							handTestRunning = false;
							if (window.modules?.vision) window.modules.vision.stop();
							if (previewVideo) previewVideo.srcObject = null;
							if (handPlaceholder) { handPlaceholder.classList.remove('hidden'); handPlaceholder.textContent = 'Tap "Start Camera Test" above'; }
							if (handStartBtn) handStartBtn.textContent = '▶️ Start Camera Test';
							const readout = document.getElementById('test-hand-readout');
							if (readout) readout.textContent = 'Not testing';
						};
						window.__testHandStop = stopHandTest;
						if (handStartBtn) {
							handStartBtn.onclick = async () => {
								if (handTestRunning) { stopHandTest(); return; }
								if (!window.modules?.vision) { if (handPlaceholder) handPlaceholder.textContent = 'Vision engine unavailable'; return; }
								handTestRunning = true;
								handStartBtn.textContent = '⏹️ Stop Camera Test';
								if (handPlaceholder) handPlaceholder.textContent = 'Starting camera...';
								await window.modules.vision.start();
								if (previewVideo && window.modules.vision.video?.srcObject) {
									previewVideo.srcObject = window.modules.vision.video.srcObject;
									previewVideo.play().catch(() => {});
									if (handPlaceholder) handPlaceholder.classList.add('hidden');
								}
							};
						}
						const voiceStartBtn = document.getElementById('test-voice-start-btn');
						let testRecognition = null;
						const stopVoiceTest = () => {
							if (testRecognition) { try { testRecognition.stop(); } catch (e) {} testRecognition = null; }
							if (voiceStartBtn) voiceStartBtn.textContent = '▶️ Start Mic Test';
							const readout = document.getElementById('test-voice-readout');
							if (readout) readout.textContent = 'Not testing';
						};
						window.__testVoiceStop = stopVoiceTest;
						if (voiceStartBtn) {
							voiceStartBtn.onclick = () => {
								if (testRecognition) { stopVoiceTest(); return; }
								const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
								const readout = document.getElementById('test-voice-readout');
								if (!SR) { if (readout) readout.textContent = 'Speech recognition not supported in this browser'; return; }
								testRecognition = new SR();
								testRecognition.continuous = true;
								testRecognition.interimResults = true;
								testRecognition.onresult = (e) => {
									const last = e.results[e.results.length - 1];
									if (readout) readout.textContent = `"${last[0].transcript}"` + (last.isFinal ? ` (${Math.round(last[0].confidence * 100)}%)` : ' (listening...)');
								};
								testRecognition.onerror = (e) => { if (readout) readout.textContent = `Mic error: ${e.error}`; };
								testRecognition.onend = () => { if (testRecognition) { try { testRecognition.start(); } catch (e) {} } };
								testRecognition.start();
								voiceStartBtn.textContent = '⏹️ Stop Mic Test';
								if (readout) readout.textContent = 'Listening...';
							};
						}
						const toneStartBtn = document.getElementById('test-tone-start-btn');
						let toneTestRunning = false;
						const stopToneTest = () => {
							if (!toneTestRunning) return;
							toneTestRunning = false;
							if (window.toneEngine) window.toneEngine.stop();
							if (toneStartBtn) toneStartBtn.textContent = '▶️ Start Mic Test';
							const readout = document.getElementById('test-tone-readout');
							if (readout) readout.textContent = 'Not testing';
						};
						window.__testToneStop = stopToneTest;
						if (toneStartBtn) {
							toneStartBtn.onclick = async () => {
								if (toneTestRunning) { stopToneTest(); return; }
								if (!window.toneEngine) { const r = document.getElementById('test-tone-readout'); if (r) r.textContent = 'Tone engine unavailable'; return; }
								toneTestRunning = true;
								toneStartBtn.textContent = '⏹️ Stop Mic Test';
								await window.toneEngine.start();
							};
						}
						const playBtn = document.getElementById('tone-test-play-btn');
						const stopBtn = document.getElementById('tone-test-stop-btn');
						const seqInput = document.getElementById('tone-test-sequence');
						const progressEl = document.getElementById('tone-test-progress');
						const noteNames = ['', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D'];
						if (playBtn) {
							playBtn.onclick = () => {
								if (!window.toneSequenceTester || window.toneSequenceTester.isPlaying) return;
								const raw = (seqInput?.value || '').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 9);
								if (raw.length === 0) { if (progressEl) progressEl.textContent = 'Enter a sequence of numbers 1-9 first.'; return; }
								window.toneSequenceTester.playSequence(raw, 200, 800, (i, total, num, freq) => {
										if (!progressEl) return;
										progressEl.textContent = (i === -1) ? 'Done ✅' : `Playing ${i + 1}/${total}: ${num} (${noteNames[num]}, ${Math.round(freq)}Hz)`;
									});
							};
						}
						if (stopBtn) {
							stopBtn.onclick = () => {
								if (window.toneSequenceTester) window.toneSequenceTester.stop();
								if (progressEl) progressEl.textContent = 'Stopped';
							};
						}
						const lockContainer = document.getElementById('test-area-lock-container');
						if (lockContainer) {
							const stopPropagationAlways = (e) => e.stopPropagation();
							['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend'].forEach(type => {
									lockContainer.addEventListener(type, stopPropagationAlways, false);
								});
						}
					}
					devModal.classList.remove('opacity-0', 'pointer-events-none');
					if (settingsModalEl) settingsModalEl.classList.add('opacity-0', 'pointer-events-none');
					if (window.lockBodyScroll) window.lockBodyScroll();
				};
			}
			if (closeDevBtn && devModal) {
				closeDevBtn.onclick = () => {
					if (window.__stopAllDevModeTests) window.__stopAllDevModeTests();
					devModal.classList.add('opacity-0', 'pointer-events-none');
					if (settingsModalEl) settingsModalEl.classList.remove('opacity-0', 'pointer-events-none');
					if (window.unlockBodyScroll) window.unlockBodyScroll();
				};
			}
		} catch (e) {
			console.error('Developer Mode wiring failed:', e);
		}
		try {
			const openCommentBtn = document.getElementById('open-comment-modal');
			const closeCommentBtn = document.getElementById('close-comment-modal');
			const commentModal = document.getElementById('comment-modal');
			const toggleCommentModal = (show) => {
				if (!commentModal) return;
				if (show) {
					commentModal.classList.remove('hidden');
					setTimeout(() => {
							commentModal.classList.remove('opacity-0', 'pointer-events-none');
							commentModal.querySelector('div')?.classList.remove('scale-90');
						}, 10);
					if (window.lockBodyScroll) window.lockBodyScroll();
				} else {
					commentModal.querySelector('div')?.classList.add('scale-90');
					commentModal.classList.add('opacity-0');
					setTimeout(() => {
							commentModal.classList.add('pointer-events-none');
							commentModal.classList.add('hidden');
						}, 300);
					if (window.unlockBodyScroll) window.unlockBodyScroll();
				}
			};
			if (openCommentBtn) openCommentBtn.onclick = () => toggleCommentModal(true);
			if (closeCommentBtn) closeCommentBtn.onclick = () => toggleCommentModal(false);
		} catch (e) {
			console.error('Comment modal wiring failed:', e);
		}
		try {
			const exportBtn = document.getElementById('hex-export-btn');
			const importBtn = document.getElementById('hex-import-btn');
			const copyBtn = document.getElementById('hex-copy-btn');
			const hexOutput = document.getElementById('hex-output');
			if (exportBtn && hexOutput) {
				exportBtn.onclick = () => {
					if (typeof window.settingsToHex === 'function') {
						hexOutput.value = window.settingsToHex();
						if (typeof showToast === 'function') showToast('Settings exported ⬇️');
					}
				};
			}
			if (copyBtn && hexOutput) {
				copyBtn.onclick = () => {
					if (!hexOutput.value) { alert('Nothing to copy - export first.'); return; }
					hexOutput.select();
					navigator.clipboard?.writeText(hexOutput.value).then(() => {
							if (typeof showToast === 'function') showToast('Copied to clipboard 📋');
						}).catch(() => document.execCommand('copy'));
				};
			}
			if (importBtn && hexOutput) {
				importBtn.onclick = () => {
					const hex = hexOutput.value.trim();
					if (!hex) { alert('Paste a hex code first.'); return; }
					if (!confirm('This will replace ALL current settings with the imported ones. Continue?')) return;
					try {
						if (typeof window.importSettingsFromHex === 'function') {
							window.importSettingsFromHex(hex);
							if (typeof showToast === 'function') showToast('Settings imported ✅');
						}
					} catch (e) {
						alert('Import failed - that doesn\'t look like a valid settings hex code.');
						console.error(e);
					}
				};
			}
		} catch (e) {
			console.error('Hex export/import wiring failed:', e);
		}
		const bindToggle = (el, prop, updateHeader = false) => {
			if (!el) return;
			el.onchange = (e) => {
				this.appSettings[prop] = e.target.checked;
				this.callbacks.onSave();
				if (updateHeader) this.updateHeaderVisibility();
			};
		};
		bindToggle(this.dom.timerToggle, 'showTimer', true);
		bindToggle(this.dom.counterToggle, 'showCounter', true);
		bindToggle(this.dom.voiceToggle, 'isVoiceInputEnabled', true);
		bindToggle(this.dom.toneCadenceToggle, 'isToneCadenceEnabled', true);
		bindToggle(this.dom.gestureToggle, 'isGestureInputEnabled', true);
		bindToggle(this.dom.handToggle, 'isHandGesturesEnabled', true);
		bindToggle(this.dom.arcamToggle, 'isArModeEnabled', true);
		bindToggle(this.dom.biggerToggle, 'isStealth1KeyEnabled', true);
		bindToggle(this.dom.fullscreenToggle, 'showFullscreenBtn', true);
		bindToggle(this.dom.upsidedownToggle, 'showUpsideDownBtn', true);
		bindToggle(this.dom.newToggle, 'isPositionSwapEnabled', true);
		bindToggle(this.dom.autoTimerToggle, 'isAutoTimerEnabled');
		bindToggle(this.dom.autoCounterToggle, 'isAutoCounterEnabled');
		bindToggle(this.dom.haptics, 'isHapticsEnabled');
		bindToggle(this.dom.ecoToggle, 'isEcoModeEnabled');
		bindToggle(this.dom.randomThemeToggle, 'isRandomThemeEnabled');
		if (this.dom.skeletonDebugToggle) {
			this.dom.skeletonDebugToggle.checked = !!this.appSettings.isSkeletonDebugEnabled;
			this.dom.skeletonDebugToggle.onchange = (e) => {
				this.appSettings.isSkeletonDebugEnabled = e.target.checked;
				if (e.target.checked && !this.appSettings.isHandGesturesEnabled && this.dom.handToggle) {
					this.dom.handToggle.checked = true;
					this.dom.handToggle.dispatchEvent(new Event('change', { bubbles: true }));
					if (typeof showToast === 'function') showToast('Hand Gestures turned on too - needed for the skeleton to have anything to draw 🦴');
				}
				this.callbacks.onSave();
			};
		}
		bindToggle(this.dom.voicecommandsToggle, 'isVoiceCommandsEnabled');
		bindToggle(this.dom.bossToggle, 'isBlackoutFeatureEnabled');
		bindToggle(this.dom.handsignalsToggle, 'isHandSignalsEnabled');
		bindToggle(this.dom.speedDelete, 'isSpeedDeletingEnabled');
		bindToggle(this.dom.volumeGesturesToggle, 'isVolumeGesturesEnabled');
		bindToggle(this.dom.speedGesturesToggle, 'isSpeedGesturesEnabled');
		bindToggle(this.dom.deleteGestureToggle, 'isDeleteGestureEnabled');
		bindToggle(this.dom.clearGestureToggle, 'isClearGestureEnabled');
		if (this.dom.introToggle) {
			this.dom.introToggle.onchange = (e) => {
				this.appSettings.showWelcomeScreen = e.target.checked;
				this.callbacks.onSave();
			};
		}
		if (this.dom.wakelockToggle) {
			this.dom.wakelockToggle.onchange = (e) => {
				this.appSettings.isWakeLockEnabled = e.target.checked;
				this.callbacks.onSave();
				if (typeof window.wakelockToggle === 'function') {
					window.wakelockToggle(e.target.checked);
				}
			};
		}
		if (this.dom.targetBtns) {
			this.dom.targetBtns.forEach(btn => {
					btn.onclick = () => {
						this.dom.targetBtns.forEach(b => { b.classList.remove('active', 'bg-primary-app'); b.classList.add('opacity-60'); });
						btn.classList.add('active', 'bg-primary-app');
						btn.classList.remove('opacity-60');
						this.currentTargetKey = btn.dataset.target;
						if (this.tempTheme) {
							const [h, s, l] = this.hexToHsl(this.tempTheme[this.currentTargetKey]);
							if (this.dom.ftHue) this.dom.ftHue.value = h;
							if (this.dom.ftSat) this.dom.ftSat.value = s;
							if (this.dom.ftLit) this.dom.ftLit.value = l;
							if (this.dom.ftPreview) this.dom.ftPreview.style.backgroundColor = this.tempTheme[this.currentTargetKey];
						}
					};
				});
		}
		[this.dom.ftHue, this.dom.ftSat, this.dom.ftLit].forEach(sl => { if (sl) sl.oninput = () => this.updateColorFromSliders(); });
		if (this.dom.ftToggle) {
			this.dom.ftToggle.onclick = () => {
				if (this.dom.ftContainer) this.dom.ftContainer.classList.remove('hidden');
				this.dom.ftToggle.style.display = 'none';
			};
		}
		if (this.dom.edSave) {
			this.dom.edSave.onclick = () => {
				if (this.tempTheme && typeof PREMADE_THEMES !== 'undefined') {
					const activeId = this.appSettings.activeTheme;
					if (PREMADE_THEMES[activeId]) {
						const newId = 'custom_' + Date.now();
						this.appSettings.customThemes[newId] = this.tempTheme;
						this.appSettings.activeTheme = newId;
					} else {
						this.appSettings.customThemes[activeId] = this.tempTheme;
					}
					this.callbacks.onSave();
					this.callbacks.onUpdate();
					this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none');
					this.dom.editorModal.querySelector('div').classList.add('scale-90');
					this.populateThemeDropdown();
				}
			};
		}
		if (this.dom.openEditorBtn) this.dom.openEditorBtn.onclick = () => this.openThemeEditor();
		if (this.dom.edCancel) this.dom.edCancel.onclick = () => { this.dom.editorModal.classList.add('opacity-0', 'pointer-events-none'); };
		if (this.dom.voiceTestBtn) this.dom.voiceTestBtn.onclick = () => this.testVoice();
		if (this.dom.voiceNameSelect) {
			this.dom.voiceNameSelect.onchange = (e) => {
				this.appSettings.selectedVoice = e.target.value || null;
				this.callbacks.onSave();
				this.testVoice();
			};
		}
		const updateVoiceLive = () => {
			if (this.dom.voicePitch) this.appSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
			if (this.dom.voiceRate) this.appSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
			if (this.dom.voiceVolume) this.appSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
		};
		if (this.dom.voicePitch) this.dom.voicePitch.oninput = updateVoiceLive;
		if (this.dom.voiceRate) this.dom.voiceRate.oninput = updateVoiceLive;
		if (this.dom.voiceVolume) this.dom.voiceVolume.oninput = updateVoiceLive;
		if (this.dom.toneCadenceToggle) {
			this.dom.toneCadenceToggle.checked = !!this.appSettings.isToneCadenceEnabled;
			this.dom.toneCadenceToggle.addEventListener('change', (e) => {
					this.appSettings.isToneCadenceEnabled = e.target.checked;
					this.callbacks.onSave();
					this.updateHeaderVisibility();
				});
		}
		if (this.dom.fullscreenToggle) {
			this.dom.fullscreenToggle.checked = !!this.appSettings.showFullscreenBtn;
			this.dom.fullscreenToggle.onchange = (e) => {
				this.appSettings.showFullscreenBtn = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		if (this.dom.upsidedownToggle) {
			this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
			this.dom.upsidedownToggle.onchange = (e) => {
				this.appSettings.showUpsideDownBtn = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		if (this.dom.headertonebtn) {
			this.dom.headertonebtn.addEventListener('click', () => {
					const isActive = this.dom.headertonebtn.classList.contains('bg-indigo-600');
					if (isActive) {
						this.dom.headertonebtn.classList.remove('bg-indigo-600', 'text-white');
						this.dom.headertonebtn.classList.add('bg-indigo-900/40', 'text-indigo-300');
						this.dom.headertonebtn.textContent = '🎵 Tones Off';
						document.getElementById('tone-debug-indicator')?.classList.add('hidden');
						if (typeof toneEngine !== 'undefined') toneEngine.stop();
					} else {
						const currentInput = this.appSettings.runtimeSettings && this.appSettings.runtimeSettings.currentInput;
						if (currentInput !== 'key9') {
							if (typeof showToast === 'function') showToast('Tone Cadence currently supports 9-Key input only 🎵');
							return;
						}
						this.dom.headertonebtn.classList.add('bg-indigo-600', 'text-white');
						this.dom.headertonebtn.classList.remove('bg-indigo-900/40', 'text-indigo-300');
						this.dom.headertonebtn.textContent = '🎵 Tones ON';
						document.getElementById('tone-debug-indicator')?.classList.remove('hidden');
						if (typeof toneEngine !== 'undefined') toneEngine.start();
					}
				});
		}
		if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => {
			this.appSettings.activeVoicePresetId = e.target.value;
			this.applyVoicePreset(e.target.value);
		};
		if (this.dom.voicePresetAdd) {
			this.dom.voicePresetAdd.onclick = () => {
				const n = prompt("New Voice Preset Name:");
				if (n) {
					const id = 'vp_' + Date.now();
					this.appSettings.voicePresets[id] = { name: n, pitch: this.appSettings.voicePitch, rate: this.appSettings.voiceRate, volume: this.appSettings.voiceVolume };
					this.appSettings.activeVoicePresetId = id;
					this.populateVoicePresetDropdown();
					this.callbacks.onSave();
				}
			};
		}
		if (this.dom.voicePresetSave) {
			this.dom.voicePresetSave.onclick = () => {
				const id = this.appSettings.activeVoicePresetId;
				if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) {
					alert("Cannot save over built-in presets. Create a new one.");
					return;
				}
				if (this.appSettings.voicePresets[id]) {
					this.appSettings.voicePresets[id] = { ...this.appSettings.voicePresets[id], pitch: parseFloat(this.dom.voicePitch.value), rate: parseFloat(this.dom.voiceRate.value), volume: parseFloat(this.dom.voiceVolume.value) };
					this.callbacks.onSave();
					alert("Voice Preset Saved!");
				}
			};
		}
		if (this.dom.voicePresetDelete) {
			this.dom.voicePresetDelete.onclick = () => {
				const id = this.appSettings.activeVoicePresetId;
				if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) {
					alert("Cannot delete built-in.");
					return;
				}
				if (confirm("Delete this voice preset?")) {
					delete this.appSettings.voicePresets[id];
					this.appSettings.activeVoicePresetId = 'standard';
					this.populateVoicePresetDropdown();
					this.applyVoicePreset('standard');
				}
			};
		}
		if (this.dom.voicePresetRename) {
			this.dom.voicePresetRename.onclick = () => {
				const id = this.appSettings.activeVoicePresetId;
				if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in.");
				const n = prompt("Rename:", this.appSettings.voicePresets[id].name);
				if (n) {
					this.appSettings.voicePresets[id].name = n;
					this.populateVoicePresetDropdown();
					this.callbacks.onSave();
				}
			};
		}
		const handleProfileSwitch = (val) => { this.callbacks.onProfileSwitch(val); this.openSettings(); };
		if (this.dom.configSelect) this.dom.configSelect.onchange = (e) => handleProfileSwitch(e.target.value);
		if (this.dom.quickConfigSelect) this.dom.quickConfigSelect.onchange = (e) => handleProfileSwitch(e.target.value);
		const bind = (el, prop, isGlobal, isInt = false, isFloat = false) => {
			if (!el) return;
			el.onchange = () => {
				let val = (el.type === 'checkbox') ? el.checked : el.value;
				if (isInt) val = parseInt(val);
				if (isFloat) val = parseFloat(val);
				if (isGlobal) {
					this.appSettings[prop] = val;
					if (prop === 'activeTheme') this.callbacks.onUpdate();
					if (prop === 'isPracticeModeEnabled') this.callbacks.onUpdate();
				} else {
					this.appSettings.runtimeSettings[prop] = val;
				}
				this.callbacks.onSave();
				this.generatePrompt();
				if (['showTimer', 'showCounter', 'autoInputMode', 'isVoiceInputEnabled', 'isArModeEnabled', 'isStealth1KeyEnabled', 'isHandGesturesEnabled', 'isGestureInputEnabled'].includes(prop)) {
					this.updateHeaderVisibility();
				}
			};
		};
		bind(this.dom.input, 'currentInput', false);
		bind(this.dom.machines, 'machineCount', false, true);
		bind(this.dom.seqLength, 'sequenceLength', false, true);
		bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', true);
		bind(this.dom.longPressToggle, 'isLongPressAutoplayEnabled', true);
		bind(this.dom.timerToggle, 'showTimer', true);
		bind(this.dom.counterToggle, 'showCounter', true);
		if (this.dom.arcamToggle) {
			this.dom.arcamToggle.onchange = (e) => {
				this.appSettings.isArModeEnabled = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		bind(this.dom.voiceToggle, 'isVoiceInputEnabled', true);
		if (this.dom.mode) {
			this.dom.mode.onchange = () => {
				this.appSettings.runtimeSettings.currentMode = this.dom.mode.value;
				this.callbacks.onSave();
				this.callbacks.onUpdate('mode_switch');
				this.generatePrompt();
			};
		}
		['input', 'machines', 'seqLength', 'playbackSpeed', 'delay', 'chunk'].forEach(id => {
				if (this.dom[id]) this.dom[id].addEventListener('change', () => this.generatePrompt());
			});
		if (this.dom.autoplay) this.dom.autoplay.onchange = (e) => { this.appSettings.isAutoplayEnabled = e.target.checked; if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.audio) this.dom.audio.onchange = (e) => { this.appSettings.isAudioEnabled = e.target.checked; if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.quickAutoplay) this.dom.quickAutoplay.onchange = (e) => { this.appSettings.isAutoplayEnabled = e.target.checked; if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.quickAudio) this.dom.quickAudio.onchange = (e) => { this.appSettings.isAudioEnabled = e.target.checked; if (this.dom.audio) this.dom.audio.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = !e.target.checked; if (this.dom.showWelcome) this.dom.showWelcome.checked = !e.target.checked; this.callbacks.onSave(); };
		if (this.dom.showWelcome) this.dom.showWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = e.target.checked; if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !e.target.checked; this.callbacks.onSave(); };
		bind(this.dom.hapticMorse, 'isHapticMorseEnabled', true);
		if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
		bind(this.dom.chunk, 'simonChunkSize', false, true);
		bind(this.dom.flash, 'isFlashEnabled', true);
		bind(this.dom.pause, 'pauseSetting', true);
		if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
		bind(this.dom.haptics, 'isHapticsEnabled', true);
		bind(this.dom.speedDelete, 'isSpeedDeletingEnabled', true);
		bind(this.dom.biggerToggle, 'isStealth1KeyEnabled', true);
		bind(this.dom.speedToggle, 'isSpeedGesturesEnabled', true);
		bind(this.dom.volgesToggle, 'isVolumeGesturesEnabled', true);
		bind(this.dom.deleteToggle, 'isDeleteGestureEnabled', true);
		bind(this.dom.clearToggle, 'isClearGestureEnabled', true);
		bind(this.dom.autoTimerToggle, 'isAutoTimerEnabled', true);
		bind(this.dom.autoCounterToggle, 'isAutoCounterEnabled', true);
		bind(this.dom.practiceMode, 'isPracticeModeEnabled', true);
		if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
		if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
		if (this.dom.seqFontSize) this.dom.seqFontSize.onchange = (e) => { this.appSettings.uiFontSizeMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onSave(); this.callbacks.onUpdate(); };
		if (this.dom.handToggle) {
			this.dom.handToggle.checked = !!this.appSettings.isHandGesturesEnabled;
			this.dom.handToggle.onchange = (e) => {
				this.appSettings.isHandGesturesEnabled = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		bindToggle(this.dom.arAutoCloseGeneralToggle, 'isArAutoCloseEnabled', () => {
				if (this.dom.arAutoClosePlayback) {
					this.dom.arAutoClosePlayback.checked = this.appSettings.isArAutoCloseEnabled;
				}
			});

		if (this.dom.arAutoClosePlayback) {
			this.dom.arAutoClosePlayback.checked = this.appSettings.isArAutoCloseEnabled ?? false;
			this.dom.arAutoClosePlayback.onchange = (e) => {
				this.appSettings.isArAutoCloseEnabled = e.target.checked;
				if (this.dom.arAutoCloseGeneralToggle) {
					this.dom.arAutoCloseGeneralToggle.checked = e.target.checked;
				}
				this.callbacks.onSave();
			};
		}
		if (this.dom.gestureMode) this.dom.gestureMode.onchange = (e) => { this.appSettings.gestureResizeMode = e.target.value; this.callbacks.onSave(); };
		if (this.dom.themeAdd) this.dom.themeAdd.onclick = () => { const n = prompt("Name:"); if (n) { const id = 'c_' + Date.now(); this.appSettings.customThemes[id] = { ...PREMADE_THEMES['default'], name: n }; this.appSettings.activeTheme = id; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); this.openThemeEditor(); } };
		if (this.dom.themeRename) this.dom.themeRename.onclick = () => { const id = this.appSettings.activeTheme; if (PREMADE_THEMES[id]) return alert("Cannot rename built-in."); const n = prompt("Rename:", this.appSettings.customThemes[id].name); if (n) { this.appSettings.customThemes[id].name = n; this.callbacks.onSave(); this.populateThemeDropdown(); } };
		if (this.dom.themeDelete) this.dom.themeDelete.onclick = () => { if (PREMADE_THEMES[this.appSettings.activeTheme]) return alert("Cannot delete built-in."); if (confirm("Delete?")) { delete this.appSettings.customThemes[this.appSettings.activeTheme]; this.appSettings.activeTheme = 'default'; this.callbacks.onSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); } };
		if (this.dom.themeSelect) this.dom.themeSelect.onchange = (e) => { this.appSettings.activeTheme = e.target.value; this.callbacks.onUpdate(); this.populateThemeDropdown(); };
		if (this.dom.fontSelect) this.dom.fontSelect.onchange = (e) => { this.appSettings.activeFontFamily = e.target.value; this.callbacks.onSave(); this.callbacks.onUpdate(); };
		if (this.dom.configAdd) this.dom.configAdd.onclick = () => { const n = prompt("Profile Name:"); if (n) this.callbacks.onProfileAdd(n); this.openSettings(); };
		if (this.dom.configRename) this.dom.configRename.onclick = () => { const n = prompt("Rename:"); if (n) this.callbacks.onProfileRename(n); this.populateConfigDropdown(); };
		if (this.dom.configDelete) this.dom.configDelete.onclick = () => { this.callbacks.onProfileDelete(); this.openSettings(); };
		if (this.dom.configSave) this.dom.configSave.onclick = () => { this.callbacks.onProfileSave(); };
		if (this.dom.themeSave) this.dom.themeSave.onclick = () => { if (this.tempTheme) { const activeId = this.appSettings.activeTheme; if (PREMADE_THEMES && PREMADE_THEMES[activeId]) { const newId = 'custom_' + Date.now(); this.appSettings.customThemes[newId] = this.tempTheme; this.appSettings.activeTheme = newId; } else { this.appSettings.customThemes[activeId] = this.tempTheme; } this.callbacks.onProfileSave(); this.callbacks.onUpdate(); this.populateThemeDropdown(); alert("Theme Saved!"); } };
		if (this.dom.closeSetupBtn) this.dom.closeSetupBtn.onclick = () => this.closeSetup();
		if (this.dom.quickSettings) this.dom.quickSettings.onclick = () => { this.closeSetup(); this.openSettings(); };
		if (this.dom.quickHelp) this.dom.quickHelp.onclick = () => { this.closeSetup(); this.generatePrompt(); if (this.dom.helpModal) this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); if (window.lockBodyScroll) window.lockBodyScroll(); };
		if (this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => { if (this.dom.helpModal) this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); if (window.unlockBodyScroll) window.unlockBodyScroll(); };
		if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => { if (this.dom.helpModal) this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); if (window.unlockBodyScroll) window.unlockBodyScroll(); };
		if (this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.generatePrompt(); if (this.dom.helpModal) this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); if (window.lockBodyScroll) window.lockBodyScroll(); };
		if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { this.callbacks.onSave(); if (this.dom.settingsModal) { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); } if (window.unlockBodyScroll) window.unlockBodyScroll(); };
		if (this.dom.tabs) {
			this.dom.tabs.forEach(btn => {
					btn.onclick = () => {
						const parent = btn.parentElement.parentElement;
						parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
						parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
						btn.classList.add('active');
						const target = btn.dataset.tab;
						if (target === 'help-voice') this.generatePrompt();
						const tabEl = document.getElementById(`tab-${target}`);
						if (tabEl) tabEl.classList.add('active');
					}
				});
		}
		if (this.dom.settingsModal) this.setupTabSwipe(this.dom.settingsModal);
		if (this.dom.helpModal) this.setupTabSwipe(this.dom.helpModal);
		if (this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
		if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => { this.closeShare(); this.openSettings(); };
		let rScale = 100;
		const updateRedeem = () => { if(this.dom.redeemImg) this.dom.redeemImg.style.transform = `scale(${rScale/100})`; };
		if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);
		if (this.dom.openRedeemSettingsBtn) this.dom.openRedeemSettingsBtn.onclick = () => { rScale = 100; updateRedeem(); this.toggleRedeem(true); };
		if (this.dom.redeemPlus) this.dom.redeemPlus.onclick = () => { rScale = Math.min(100, rScale + 10); updateRedeem(); };
		if (this.dom.redeemMinus) this.dom.redeemMinus.onclick = () => { rScale = Math.max(10, rScale - 10); updateRedeem(); };
		this.qrScale = 100;
		this.updateQR = () => { if (this.dom.qrImg) this.dom.qrImg.style.transform = `scale(${this.qrScale / 100})`; };
		if (this.dom.qrZoomIn) this.dom.qrZoomIn.onclick = () => { this.qrScale = Math.min(400, this.qrScale + 10); this.updateQR(); };
		if (this.dom.qrZoomOut) this.dom.qrZoomOut.onclick = () => { this.qrScale = Math.max(50, this.qrScale - 10); this.updateQR(); };
		if (this.dom.openDonateBtn) this.dom.openDonateBtn.onclick = () => this.toggleDonate(true);
		if (this.dom.closeDonateBtn) this.dom.closeDonateBtn.onclick = () => this.toggleDonate(false);
		if (this.dom.copyLinkBtn) this.dom.copyLinkBtn.onclick = () => { navigator.clipboard.writeText(window.location.href).then(() => alert("Link Copied!")); };
		if (this.dom.copyPromptBtn) this.dom.copyPromptBtn.onclick = () => { if (this.dom.promptDisplay) { this.dom.promptDisplay.select(); navigator.clipboard.writeText(this.dom.promptDisplay.value).then(() => alert("Prompt Copied!")); } };
		if (this.dom.generatePromptBtn) this.dom.generatePromptBtn.onclick = () => { this.generatePrompt(); if (this.dom.promptDisplay) { this.dom.promptDisplay.style.opacity = '0.5'; setTimeout(() => this.dom.promptDisplay.style.opacity = '1', 150); } };
		if (this.dom.nativeShareBtn) this.dom.nativeShareBtn.onclick = () => { if (navigator.share) { navigator.share({ title: "Follow Me", url: window.location.href }); } else { alert("Share not supported"); } };
		if (this.dom.chatShareBtn) this.dom.chatShareBtn.onclick = () => { window.location.href = `sms:?body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
		if (this.dom.emailShareBtn) this.dom.emailShareBtn.onclick = () => { window.location.href = `mailto:?subject=Follow%20Me%20App&body=Check%20out%20Follow%20Me:%20${window.location.href}`; };
		if (this.dom.btnCashMain) this.dom.btnCashMain.onclick = () => { window.open('https://cash.app/$jwo83', '_blank'); };
		if (this.dom.btnPaypalMain) this.dom.btnPaypalMain.onclick = () => { window.open('https://www.paypal.me/Oyster981', '_blank'); };
		document.querySelectorAll('.donate-quick-btn').forEach(btn => {
				btn.onclick = () => {
					const app = btn.dataset.app;
					const amt = btn.dataset.amount;
					if (app === 'cash') window.open(`https://cash.app/$jwo83/${amt}`, '_blank');
					if (app === 'paypal') window.open(`https://www.paypal.me/Oyster981/${amt}`, '_blank');
				};
			});
		if (this.dom.restoreBtn) {
			this.dom.restoreBtn.onclick = () => { if (confirm("Factory Reset?")) this.callbacks.onReset(); };
		}
		if (this.dom.nukeBtn) {
			this.dom.nukeBtn.onclick = () => {
				if (confirm("☢️ NUKE APP? This will wipe all saved data, clear browser caches, unregister Service Workers, and force a fresh update from the server.")) {
					if ('serviceWorker' in navigator) {
						navigator.serviceWorker.getRegistrations().then(regs => {
								for (let r of regs) r.unregister();
							});
					}
					if (window.caches) {
						caches.keys().then(names => {
								for (let name of names) caches.delete(name);
							});
					}
					localStorage.clear();
					sessionStorage.clear();
					window.location.reload(true);
				}
			};
		}
		if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onUpdate(); };
		if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onUpdate(); };
		if (this.dom.gestureTapSlider) {
			this.dom.gestureTapSlider.oninput = (e) => {
				const val = parseInt(e.target.value);
				this.appSettings.gestureTapDelay = val;
				if (this.dom.gestureTapVal) this.dom.gestureTapVal.textContent = val + 'ms';
				this.callbacks.onSave();
			};
		}
		if (this.dom.gestureSwipeSlider) {
			this.dom.gestureSwipeSlider.oninput = (e) => {
				const val = parseInt(e.target.value);
				this.appSettings.gestureSwipeDist = val;
				if (this.dom.gestureSwipeVal) this.dom.gestureSwipeVal.textContent = val + 'px';
				this.callbacks.onSave();
			};
		}
	}
	populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
	populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
	openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); if (window.lockBodyScroll) window.lockBodyScroll(); }
	openSetup() { this.populateConfigDropdown(); this.updateUIFromSettings(); this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90'); if (window.lockBodyScroll) window.lockBodyScroll(); }
	closeSetup() { this.callbacks.onSave(); this.dom.setupModal.classList.add('opacity-0'); this.dom.setupModal.querySelector('div').classList.add('scale-90'); setTimeout(() => this.dom.setupModal.classList.add('pointer-events-none'), 300); if (window.unlockBodyScroll) window.unlockBodyScroll(); }
	generatePrompt() {
		if (!this.dom.promptDisplay) return;
		const ps = this.appSettings.runtimeSettings;
		const max = ps.currentInput === 'key12' ? 12 : 9;
		const speed = this.appSettings.playbackSpeed || 1.0;
		const machines = ps.machineCount || 1;
		const chunk = ps.simonChunkSize || 3;
		const delay = (ps.simonInterSequenceDelay / 1000) || 0;
		let instructions = "";
		if (machines > 1) {
			instructions = `MODE: MULTI-MACHINE AUTOPLAY (${machines} Machines).\nYOUR JOB:\n1. I will speak a batch of ${machines} numbers at once.\n2. You must immediately SORT them:\n   - 1st number -> Machine 1\n   - 2nd number -> Machine 2\n   - 3rd number -> Machine 3 (if active), etc.\n3. IMMEDIATELY after hearing the numbers, you must READ BACK the sequences for all machines.\n\nREADBACK RULES (Interleaved Chunking):\n- Recite the history in chunks of ${chunk}.\n- Order: Machine 1 (Chunk 1) -> Machine 2 (Chunk 1) -> ... -> Machine 1 (Chunk 2) -> Machine 2 (Chunk 2)...\n- Do not stop between machines. Flow through the list.\n- Pause ${delay} seconds between machine switches.`;
		} else {
			if (ps.currentMode === 'simon') {
				instructions = `MODE: SIMON SAYS (Single Machine).\n- The sequence grows by one number each round.\n- I will speak the NEW number.\n- You must add it to the list and READ BACK the ENTIRE list from the start.`;
			} else {
				instructions = `MODE: UNIQUE (Random/Non-Repeating).\n- Every round is a fresh random sequence.\n- I will speak a number. You simply repeat that number to confirm.\n- Keep a running list. If I say "Review", read the whole list.`;
			}
		}
		const promptText = `Act as a professional Sequence Caller for a memory skill game. \nYou are the "Caller" (App). I am the "Player" (User).\n\nSETTINGS:\n- Max Number: ${max}\n- Playback Speed: ${speed}x (Speak fast)\n- Active Machines: ${machines}\n- Chunk Size: ${chunk}\n\n${instructions}\n\nYOUR RULES:\n1. Speak clearly but quickly. No fluff. No conversational filler.\n2. If I get it wrong, correct me immediately.\n3. If I say "Status", tell me the current round/sequence length.\n\nSTART IMMEDIATELY upon my next input. Waiting for signal.`;
		this.dom.promptDisplay.value = promptText;
	}
	updateUIFromSettings() {
		const ps = this.appSettings.runtimeSettings;
		if (this.dom.input) this.dom.input.value = ps.currentInput;
		if (this.dom.mode) this.dom.mode.value = ps.currentMode;
		if (this.dom.machines) this.dom.machines.value = ps.machineCount;
		if (this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
		if (this.dom.autoClear) this.dom.autoClear.checked = this.appSettings.isUniqueRoundsAutoClearEnabled;
		if (this.dom.autoplay) this.dom.autoplay.checked = this.appSettings.isAutoplayEnabled;
		if (this.dom.filterToggles) {
			if (!this.appSettings.activeGestureFilters) {
				this.appSettings.activeGestureFilters = ['Poses', 'Pinches', 'Counts', 'Shapes', 'Motion', 'Transitions', 'Combos', ...Object.keys(GESTURE_CATEGORIES)];
			}
			this.dom.filterToggles.forEach(toggle => {
					toggle.checked = this.appSettings.activeGestureFilters.includes(toggle.dataset.group);
				});
			this.applyHandGestureFilters();
		}
		this.applyTouchGestureOptions();
		if (this.dom.audio) this.dom.audio.checked = this.appSettings.isAudioEnabled;
		if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.isAutoplayEnabled;
		if (this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.isAudioEnabled;
		if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
		if (this.dom.showWelcome) this.dom.showWelcome.checked = this.appSettings.showWelcomeScreen;
		if (this.dom.hapticMorse) this.dom.hapticMorse.checked = this.appSettings.isHapticMorseEnabled;
		if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = (this.appSettings.playbackSpeed || 1.0).toFixed(2);
		if (this.dom.voiceTriggerSelect) {
			this.dom.voiceTriggerSelect.value = this.appSettings.voiceTriggerWord || 'set';
			this.dom.voiceTriggerSelect.onchange = (e) => {
				this.appSettings.voiceTriggerWord = e.target.value;
				this.callbacks.onSave();
				if (typeof voiceModule !== 'undefined' && voiceModule) voiceModule.initEngine();
			};
		}
		if (this.dom.chunk) this.dom.chunk.value = ps.simonChunkSize;
		if (this.dom.delay) this.dom.delay.value = (ps.simonInterSequenceDelay / 1000);
		if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.voicePitch || 1.0;
		this.populateVoiceNameDropdown();
		if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.voiceRate || 1.0;
		if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.voiceVolume || 1.0;
		if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.activeVoicePresetId || 'standard';
		if (this.dom.practiceMode) this.dom.practiceMode.checked = this.appSettings.isPracticeModeEnabled;
		if (this.dom.biggerToggle) this.dom.biggerToggle.checked = this.appSettings.isStealth1KeyEnabled;
		if (this.dom.arcamToggle) this.dom.arcamToggle.checked = !!this.appSettings.isArModeEnabled;
		if (this.dom.voiceToggle) this.dom.voiceToggle.checked = !!this.appSettings.isVoiceInputEnabled;
		if (this.dom.longPressToggle) this.dom.longPressToggle.checked = (typeof this.appSettings.isLongPressAutoplayEnabled === 'undefined') ? true : this.appSettings.isLongPressAutoplayEnabled;
		if (this.dom.timerToggle) this.dom.timerToggle.checked = !!this.appSettings.showTimer;
		if (this.dom.counterToggle) this.dom.counterToggle.checked = !!this.appSettings.showCounter;
		if (this.dom.calibAudioSlider) this.dom.calibAudioSlider.value = this.appSettings.sensorAudioThresh || -85;
		if (this.dom.calibCamSlider) this.dom.calibCamSlider.value = this.appSettings.sensorCamThresh || 30;
		if (this.dom.haptics) this.dom.haptics.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
		if (this.dom.speedDelete) this.dom.speedDelete.checked = (typeof this.appSettings.isSpeedDeletingEnabled === 'undefined') ? true : this.appSettings.isSpeedDeletingEnabled;
		if (this.dom.speedGesturesToggle) this.dom.speedGesturesToggle.checked = !!this.appSettings.isSpeedGesturesEnabled;
		if (this.dom.volumeGesturesToggle) this.dom.volumeGesturesToggle.checked = !!this.appSettings.isVolumeGesturesEnabled;
		if (this.dom.deleteGestureToggle) this.dom.deleteGestureToggle.checked = !!this.appSettings.isDeleteGestureEnabled;
		if (this.dom.clearGestureToggle) this.dom.clearGestureToggle.checked = !!this.appSettings.isClearGestureEnabled;
		if (this.dom.autoTimerToggle) this.dom.autoTimerToggle.checked = !!this.appSettings.isAutoTimerEnabled;
		if (this.dom.autoCounterToggle) this.dom.autoCounterToggle.checked = !!this.appSettings.isAutoCounterEnabled;
		if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
		if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
		if (this.dom.seqFontSize) this.dom.seqFontSize.value = Math.round((this.appSettings.uiFontSizeMultiplier || 1.0) * 100);
		if (this.dom.gestureTapSlider) {
			const tapVal = this.appSettings.gestureTapDelay || 300;
			this.dom.gestureTapSlider.value = tapVal;
			this.dom.gestureTapVal.textContent = tapVal + 'ms';
		}
		if (this.dom.gestureSwipeSlider) {
			const swipeVal = this.appSettings.gestureSwipeDist || 30;
			this.dom.gestureSwipeSlider.value = swipeVal;
			this.dom.gestureSwipeVal.textContent = swipeVal + 'px';
		}
		if (this.dom.gestureMode) this.dom.gestureMode.value = this.appSettings.gestureResizeMode || 'global';
		if (this.dom.bossToggle) this.dom.bossToggle.checked = this.appSettings.isBlackoutFeatureEnabled;
		if (this.dom.gestureToggle) this.dom.gestureToggle.checked = !!this.appSettings.isGestureInputEnabled;
		if (this.dom.handToggle) this.dom.handToggle.checked = !!this.appSettings.isHandGesturesEnabled;
		if (this.dom.handsignalsToggle) this.dom.handsignalsToggle.checked = !!this.appSettings.isHandSignalsEnabled;
		if (this.dom.voicecommandsToggle) this.dom.voicecommandsToggle.checked = !!this.appSettings.isVoiceCommandsEnabled;
		if (this.dom.wakelockToggle) this.dom.wakelockToggle.checked = (typeof this.appSettings.isWakeLockEnabled === 'undefined') ? true : this.appSettings.isWakeLockEnabled;
		if (this.dom.randomThemeToggle) this.dom.randomThemeToggle.checked = !!this.appSettings.isRandomThemeEnabled;
		if (this.dom.skeletonDebugToggle) this.dom.skeletonDebugToggle.checked = !!this.appSettings.isSkeletonDebugEnabled;
		if (this.dom.fontSelect) this.dom.fontSelect.value = this.appSettings.activeFontFamily || "'Inter', sans-serif";
		if (this.dom.newToggle) this.dom.newToggle.checked = !!this.appSettings.isPositionSwapEnabled;
		if (this.dom.fullscreenToggle) {
			this.dom.fullscreenToggle.checked = !!this.appSettings.showFullscreenBtn;
		}
		if (this.dom.upsidedownToggle) {
			this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
		}
		if (this.dom.arSpeedSelect) {
			const speedVal = this.appSettings.arPlaybackSpeed || 1.0;
			this.dom.arSpeedSelect.value = String(speedVal);
		}
		this.updateHeaderVisibility();
	}
	updateHeaderVisibility() {
		const header = document.getElementById('aux-control-header');
		const timerBtn = document.getElementById('headertimerbtn');
		const counterBtn = document.getElementById('headercounterbtn');
		const micBtn = document.getElementById('headervoicebtn');
		const camBtn = document.getElementById('headerarcambtn');
		const gestureBtn = document.getElementById('headertouchbtn');
		const stealthBtn = document.getElementById('headerbiggerbtn');
		const handBtn = document.getElementById('headerhandbtn');
		if (!header) return;
		const showTimer = !!this.appSettings.showTimer;
		const showCounter = !!this.appSettings.showCounter;
		const showMic = !!this.appSettings.isVoiceInputEnabled;
		const showCam = !!this.appSettings.isArModeEnabled;
		const showGesture = !!this.appSettings.isGestureInputEnabled;
		const showStealth = !!this.appSettings.isStealth1KeyEnabled;
		const showHand = !!this.appSettings.isHandGesturesEnabled;
		if (this.dom.headerfullscreenbtn) {
			if (this.appSettings.showFullscreenBtn) {
				this.dom.headerfullscreenbtn.classList.remove('hidden');
			} else {
				this.dom.headerfullscreenbtn.classList.add('hidden');
			}
		}
		if (this.dom.headerupsidedownbtn) {
			if (this.appSettings.showUpsideDownBtn) {
				this.dom.headerupsidedownbtn.classList.remove('hidden');
			} else {
				this.dom.headerupsidedownbtn.classList.add('hidden');
			}
		}
		const showSwap = !!this.appSettings.isPositionSwapEnabled;
		if(timerBtn) timerBtn.classList.toggle('hidden', !showTimer);
		if(counterBtn) counterBtn.classList.toggle('hidden', !showCounter);
		if(micBtn) micBtn.classList.toggle('hidden', !showMic);
		if(camBtn) camBtn.classList.toggle('hidden', !showCam);
		if(gestureBtn) gestureBtn.classList.toggle('hidden', !showGesture);
		if(stealthBtn) stealthBtn.classList.toggle('hidden', !showStealth);
		if(handBtn) handBtn.classList.toggle('hidden', !showHand);
		if(this.dom.headerswapbtn) this.dom.headerswapbtn.classList.toggle('hidden', !showSwap);
		if (this.dom.headertonebtn) {
			this.dom.headertonebtn.classList.toggle('hidden', !this.appSettings.isToneCadenceEnabled);
		}
		if (!showTimer && !showCounter && !showMic && !showCam && !showGesture && !showStealth && !showHand && !showSwap && !this.appSettings.isToneCadenceEnabled) {
			header.classList.add('header-hidden');
		} else {
			header.classList.remove('header-hidden');
		}
	}
	hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
	hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
	populateMappingUI() {
		if (!this.dom) return;
		if (!this.appSettings) return;
		if (!this.appSettings.gestureMappings || Object.keys(this.appSettings.gestureMappings).length === 0) {
			this.applyDefaultGestureMappings();
		}
		this.applyDefaultMappingsIfEmpty();
		if (!this.appSettings.gestureProfiles) this.appSettings.gestureProfiles = {};
		const tapSlider = document.getElementById('gesture-tap-slider');
		const swipeSlider = document.getElementById('gesture-swipe-slider');
		const tapVal = document.getElementById('gesture-tap-val');
		const swipeVal = document.getElementById('gesture-swipe-val');
		if (tapSlider) tapSlider.value = this.appSettings.gestureTapDelay || 300;
		if (swipeSlider) swipeSlider.value = this.appSettings.gestureSwipeDist || 30;
		if (tapVal) tapVal.textContent = (this.appSettings.gestureTapDelay || 300) + 'ms';
		if (swipeVal) swipeVal.textContent = (this.appSettings.gestureSwipeDist || 30) + 'px';
		{
			if(tapSlider) {
				tapSlider.oninput = (e) => {
					const val = parseInt(e.target.value);
					this.appSettings.gestureTapDelay = val;
					if(tapVal) tapVal.textContent = val + 'ms';
					this.callbacks.onSave();
				};
			}
			if(swipeSlider) {
				swipeSlider.oninput = (e) => {
					const val = parseInt(e.target.value);
					this.appSettings.gestureSwipeDist = val;
					if(swipeVal) swipeVal.textContent = val + 'px';
					this.callbacks.onSave();
				};
			}
			const moreSliders = [
				{ id: 'gesture-longpress-slider', valId: 'gesture-longpress-val', prop: 'gestureLongPressTime', unit: 'ms', def: 300 },
				{ id: 'gesture-tapprecision-slider', valId: 'gesture-tapprecision-val', prop: 'gestureTapPrecision', unit: 'px', def: 30 },
				{ id: 'gesture-spatial-slider', valId: 'gesture-spatial-val', prop: 'gestureSpatialThreshold', unit: 'px', def: 10 },
				{ id: 'gesture-longswipe-slider', valId: 'gesture-longswipe-val', prop: 'gestureLongSwipeThreshold', unit: 'px', def: 150 },
				{ id: 'gesture-multiswipe-slider', valId: 'gesture-multiswipe-val', prop: 'gestureMultiSwipeThreshold', unit: 'px', def: 10 },
				{ id: 'gesture-handcooldown-slider', valId: 'gesture-handcooldown-val', prop: 'handGestureCooldown', unit: 'ms', def: 2000 },
				{ id: 'gesture-handhold-slider', valId: 'gesture-handhold-val', prop: 'handHoldFrames', unit: '', def: 4 },
				{ id: 'voice-confidence-slider', valId: 'voice-confidence-val', prop: 'voiceConfidenceThreshold', unit: '%', def: 50 },
				{ id: 'tone-threshold-slider', valId: 'tone-threshold-val', prop: 'toneVolumeThreshold', unit: 'dB', def: -70 },
				{ id: 'gesture-anchordist-slider', valId: 'gesture-anchordist-val', prop: 'touchAnchorStillDistance', unit: 'px', def: 15 },
				{ id: 'gesture-anchorhold-slider', valId: 'gesture-anchorhold-val', prop: 'touchAnchorMinHoldTime', unit: 'ms', def: 150 },
				{ id: 'gesture-chordwindow-slider', valId: 'gesture-chordwindow-val', prop: 'touchChordSimultaneityWindow', unit: 'ms', def: 50 },
			];
			moreSliders.forEach(({ id, valId, prop, unit, def }) => {
					const slider = document.getElementById(id);
					const valEl = document.getElementById(valId);
					if (!slider) return;
					const current = (this.appSettings[prop] !== undefined && this.appSettings[prop] !== null) ? this.appSettings[prop] : def;
					slider.value = current;
					if (valEl) valEl.textContent = current + unit;
					slider.oninput = (e) => {
						const val = parseInt(e.target.value);
						this.appSettings[prop] = val;
						if (valEl) valEl.textContent = val + unit;
						this.callbacks.onSave();
					};
				});
			const lockToggle = document.getElementById('sliderLockToggle');
			const applyLockState = (locked) => {
				document.querySelectorAll('.sensitivity-slider input[type="range"]').forEach(s => {
						s.disabled = locked;
						s.parentElement.style.opacity = locked ? '0.5' : '1';
					});
			};
			if (lockToggle) {
				lockToggle.checked = !!this.appSettings.isSliderLockEnabled;
				applyLockState(lockToggle.checked);
				lockToggle.onchange = (e) => {
					this.appSettings.isSliderLockEnabled = e.target.checked;
					applyLockState(e.target.checked);
					this.callbacks.onSave();
				};
			}
		}
		this.bindMappingEvents();
		return;
	}
	populateMorseUI() {
		const tab = document.getElementById('morse-container-target');
		if (!tab) return;
		let container = document.getElementById('morse-container');
		if (!container) {
			container = document.createElement('div');
			container.id = 'morse-container';
			container.className = "";
			tab.appendChild(container);
		}
		const morseOptions = [];
		const chars = ['.', '-'];
		const generate = (current) => {
			if (current.length > 0) morseOptions.push(current);
			if (current.length >= 5) return;
			chars.forEach(c => generate(current + c));
		};
		generate('');
		morseOptions.sort((a, b) => {
				const lenDiff = a.length - b.length;
				if (lenDiff !== 0) {
					return lenDiff;
				}
				return a.localeCompare(b);
			});
		const labels = ["1", "2", "3", "4", "5", "6 C", "7 D", "8 E", "9 F", "10 G", "11 A", "12 B"];
		let gridHtml = `<div class="grid grid-cols-4 gap-y-3 gap-x-2 items-center">`;
		labels.forEach((label, index) => {
				const val = index + 1;
				let optionsHtml = `<optgroup label="Morse Patterns">`;
				optionsHtml += morseOptions.map(m => `<option value="${m}">${m}</option>`).join('');
				optionsHtml += `</optgroup>`;
				gridHtml += `
				<div class="text-right text-xs font-bold text-gray-400 pr-1 whitespace-nowrap">${label}</div>
				<select class="bg-gray-800 text-white text-xs p-1 rounded border border-gray-600 focus:border-primary-app outline-none h-8 w-full font-mono tracking-widest text-center" data-morse-id="${val}">
				${optionsHtml}
				</select>
				`;
			});
		gridHtml += `</div>`;
		container.innerHTML = `
		<h3 class="text-sm font-bold uppercase text-gray-400 mb-3">Haptic Output Mapping</h3>
		${gridHtml}
		<p class="text-[10px] text-gray-500 mt-3 text-center">Custom dot/dash patterns for playback.</p>
		`;
		const selects = container.querySelectorAll('select');
		selects.forEach(sel => {
				const id = sel.dataset.morseId;
				if (this.appSettings.morseMappings && this.appSettings.morseMappings[id]) {
					sel.value = this.appSettings.morseMappings[id];
				} else {
					let d = "";
					const n = parseInt(id);
					if (n <= 3) d = ".".repeat(n);
					else if (n <= 6) d = "-" + ".".repeat(n-3);
					else if (n <= 9) d = "--" + ".".repeat(n-6);
					else d = "---" + ".".repeat(n-10);
					sel.value = d;
				}
				sel.onchange = () => {
					if (!this.appSettings.morseMappings) this.appSettings.morseMappings = {};
					this.appSettings.morseMappings[id] = sel.value;
					this.callbacks.onSave();
					if (navigator.vibrate) {
						const pattern = [];
						const speed = this.appSettings.playbackSpeed || 1.0;
						const factor = 1.0 / speed;
						const DOT = 100 * factor, DASH = 300 * factor, GAP = 100 * factor;
						for (let char of sel.value) {
							if(char === '.') pattern.push(DOT);
							if(char === '-') pattern.push(DASH);
							pattern.push(GAP);
						}
						if(pattern.length) navigator.vibrate(pattern);
					}
				};
			});
	}
	applyDefaultGestureMappings() {
		this.appSettings.gestureMappings = this.appSettings.gestureMappings || {};
		const defaults = {
			'k9_1': { gesture: 'tap' },
			'k9_2': { gesture: 'double_tap' },
			'k9_3': { gesture: 'triple_tap' },
			'k9_4': { gesture: 'tap_2f' },
			'k9_5': { gesture: 'double_tap_2f' },
			'k9_6': { gesture: 'triple_tap_2f' },
			'k9_7': { gesture: 'tap_3f' },
			'k9_8': { gesture: 'double_tap_3f' },
			'k9_9': { gesture: 'triple_tap_3f' },
			'k12_1': { gesture: 'tap' },
			'k12_2': { gesture: 'double_tap' },
			'k12_3': { gesture: 'triple_tap' },
			'k12_4': { gesture: 'long_tap' },
			'k12_5': { gesture: 'tap_2f' },
			'k12_6': { gesture: 'double_tap_2f' },
			'k12_7': { gesture: 'triple_tap_2f' },
			'k12_8': { gesture: 'long_tap_2f' },
			'k12_9': { gesture: 'tap_3f' },
			'k12_10': { gesture: 'double_tap_3f' },
			'k12_11': { gesture: 'triple_tap_3f' },
			'k12_12': { gesture: 'long_tap_3f' },
			'piano_C': { gesture: 'swipe_nw' },
			'piano_D': { gesture: 'swipe_left' },
			'piano_E': { gesture: 'swipe_sw' },
			'piano_F': { gesture: 'swipe_down' },
			'piano_G': { gesture: 'swipe_se' },
			'piano_A': { gesture: 'swipe_right' },
			'piano_B': { gesture: 'swipe_ne' },
			'piano_1': { gesture: 'swipe_left_2f' },
			'piano_2': { gesture: 'swipe_nw_2f' },
			'piano_3': { gesture: 'swipe_up_2f' },
			'piano_4': { gesture: 'swipe_ne_2f' },
			'piano_5': { gesture: 'swipe_right_2f' }
		};
		this.appSettings.gestureMappings = Object.assign({}, defaults, this.appSettings.gestureMappings || {});
	}
	applyDefaultMappingsIfEmpty() {
		if (this.appSettings.mappings && Object.keys(this.appSettings.mappings).length > 0) return;
		this.appSettings.mappings = {};
		const ensure = (key) => {
			if (!this.appSettings.mappings[key]) this.appSettings.mappings[key] = { touch: 'none', handGesture: 'none', morse: '' };
			return this.appSettings.mappings[key];
		};
		const applyHandPreset = (presetId) => {
			const preset = HAND_MAPPING_PRESETS[presetId];
			if (!preset) return;
			Object.keys(preset.map).forEach(key => {
					const val = preset.map[key];
					ensure(key).handGesture = val === 'none' ? 'none' : parseInt(val, 10);
				});
		};
		applyHandPreset('9_hand_counts');
		applyHandPreset('12_hand_counts');
		applyHandPreset('piano_hand_default');
	}
}
