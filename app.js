// Viewport Preview mode: when this file is loaded inside the Landscape/Split Screen configure
// modal's live iframe, ?vpPreview=1&vpBucket=split66 (etc) forces detectViewportBucket() to
// report that bucket regardless of the real device's screen/window ratio, so the preview can
// show any bucket without physically resizing the browser window.
window.__fmBuildMarker = 'v163-ratio-cancellation-verified';
(function() {
	try {
		const params = new URLSearchParams(location.search);
		if (params.get('vpPreview') === '1') {
			const forced = params.get('vpBucket');
			if (forced) window.__vpPreviewForceBucket = forced;
		}
	} catch (e) {}
})();
const TONE_TABLE = [
	{ n: 1, f: 261.63, name: 'C' },
	{ n: 2, f: 293.66, name: 'D' },
	{ n: 3, f: 329.63, name: 'E' },
	{ n: 4, f: 349.23, name: 'F' },
	{ n: 5, f: 392.00, name: 'G' },
	{ n: 6, f: 440.00, name: 'A' },
	{ n: 7, f: 493.88, name: 'B' },
	{ n: 8, f: 523.25, name: 'C' },
	{ n: 9, f: 587.33, name: 'D' }
];
const HAND_GESTURE_GROUPS = [
	{
		id: "hand_poses",
		name: "Hand Static Poses",
		enabled: true,
		gestures: [
			{ id: "0", name: "✊ Fist" },
			{ id: "18", name: "🤘 Rock On" },
			{ id: "34", name: "🤙 Shaka" },
			{ id: "48", name: "🫵 Gun / L-Shape" },
			{ id: "50", name: "🤟 Spidey / ILY" },
			{ id: "600", name: "👍 Thumbs Up" },
			{ id: "601", name: "👎 Thumbs Down" }
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
		id: "hand_combos",
		name: "Hand Combos (specific finger combinations)",
		enabled: true,
		gestures: [
			{ id: "12", name: "🥢 Chopsticks" },
			{ id: "14", name: "🤟 Three (No Index)" },
			{ id: "20", name: "🤞 Index + Ring" },
			{ id: "22", name: "Index + Ring + Pinky" },
			{ id: "26", name: "✌️ Peace + Pinky" },
			{ id: "36", name: "Thumb + Ring" },
			{ id: "38", name: "Thumb + Ring + Pinky" },
			{ id: "40", name: "Thumb + Middle" },
			{ id: "42", name: "Thumb + Middle + Pinky" },
			{ id: "44", name: "Thumb + Middle + Ring" },
			{ id: "46", name: "Four (No Index)" },
			{ id: "52", name: "Thumb + Index + Ring" },
			{ id: "54", name: "Four (No Middle)" },
			{ id: "56", name: "🖖 Scout Sign" },
			{ id: "58", name: "Four (No Ring)" },
			{ id: "60", name: "Five (No Pinky)" },
			{ id: "101", name: "🤏 Pinch (Middle)" },
			{ id: "102", name: "🤏 Pinch (Ring)" },
			{ id: "103", name: "🤏 Pinch (Pinky)" }
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
	},
	{
		id: "hand_transitions",
		name: "Motion Transitions",
		enabled: true,
		gestures: [
			{ id: "400", name: "🗑️ Throw (Fist → Open)" },
			{ id: "401", name: "✊ Grab (Open → Fist)" },
			{ id: "402", name: "👐 Release (Pinch → Open)" },
			{ id: "403", name: "🤏 Snatch (Open → Pinch)" },
			{ id: "404", name: "☝️ Point Out (Fist → 1 Finger)" }
		]
	},]
const TRANSITION_GESTURES = {
	'0->62':   { id: 400, label: '🗑️ Throw (Fist → Open)' },
	'62->0':   { id: 401, label: '✊ Grab (Open → Fist)' },
	'100->62': { id: 402, label: '👐 Release (Pinch → Open)' },
	'62->100': { id: 403, label: '🤏 Snatch (Open → Pinch)' },
	'0->16':   { id: 404, label: '☝️ Point Out (Fist → 1 Finger)' },
};
const GESTURE_DICTIONARY = {
	0: 'FIST_KNUCKLES_FWD',           1: 'FIST_PALM_FWD',
	2: 'PINKY_KNUCKLES_FWD',          3: 'PINKY_PALM_FWD',
	4: 'RING_KNUCKLES_FWD',           5: 'RING_PALM_FWD',
	6: 'RING_PINKY_KNUCKLES_FWD',     7: 'RING_PINKY_PALM_FWD',
	8: 'MIDDLE_KNUCKLES_FWD',         9: 'MIDDLE_PALM_FWD',
	10: 'MIDDLE_PINKY_KNUCKLES_FWD',  11: 'MIDDLE_PINKY_PALM_FWD',
	12: 'CHOPSTICKS_KNUCKLES_FWD',    13: 'CHOPSTICKS_PALM_FWD',
	14: 'THREE_FINGERS_NO_INDEX_K',   15: 'THREE_FINGERS_NO_INDEX_P',
	16: 'INDEX_KNUCKLES_FWD',         17: 'INDEX_PALM_FWD',
	18: 'ROCK_ON_KNUCKLES_FWD',       19: 'ROCK_ON_PALM_FWD',
	20: 'INDEX_RING_KNUCKLES_FWD',    21: 'INDEX_RING_PALM_FWD',
	22: 'INDEX_RING_PINKY_K',         23: 'INDEX_RING_PINKY_P',
	24: 'PEACE_KNUCKLES_FWD',         25: 'PEACE_PALM_FWD',
	26: 'PEACE_PINKY_KNUCKLES_FWD',   27: 'PEACE_PINKY_PALM_FWD',
	28: 'THREE_FINGERS_KNUCKLES_FWD', 29: 'THREE_FINGERS_PALM_FWD',
	30: 'FOUR_FINGERS_KNUCKLES_FWD',  31: 'FOUR_FINGERS_PALM_FWD',
	32: 'THUMB_KNUCKLES_FWD',         33: 'THUMB_PALM_FWD',
	34: 'SHAKA_KNUCKLES_FWD',         35: 'SHAKA_PALM_FWD',
	36: 'THUMB_RING_KNUCKLES_FWD',    37: 'THUMB_RING_PALM_FWD',
	38: 'THUMB_RING_PINKY_K',         39: 'THUMB_RING_PINKY_P',
	40: 'THUMB_MIDDLE_KNUCKLES_FWD',  41: 'THUMB_MIDDLE_PALM_FWD',
	42: 'THUMB_MIDDLE_PINKY_K',       43: 'THUMB_MIDDLE_PINKY_P',
	44: 'THUMB_MIDDLE_RING_K',        45: 'THUMB_MIDDLE_RING_P',
	46: 'FOUR_FINGERS_NO_INDEX_K',    47: 'FOUR_FINGERS_NO_INDEX_P',
	48: 'GUN_KNUCKLES_FWD',           49: 'GUN_PALM_FWD',
	50: 'SPIDERMAN_KNUCKLES_FWD',     51: 'SPIDERMAN_PALM_FWD',
	52: 'THUMB_INDEX_RING_K',         53: 'THUMB_INDEX_RING_P',
	54: 'FOUR_FINGERS_NO_MIDDLE_K',   55: 'FOUR_FINGERS_NO_MIDDLE_P',
	56: 'SCOUT_KNUCKLES_FWD',         57: 'SCOUT_PALM_FWD',
	58: 'FOUR_FINGERS_NO_RING_K',     59: 'FOUR_FINGERS_NO_RING_P',
	60: 'FIVE_FINGERS_NO_PINKY_K',    61: 'FIVE_FINGERS_NO_PINKY_P',
	62: 'FIVE_FINGERS_KNUCKLES_FWD',  63: 'FIVE_FINGERS_PALM_FWD',
	100: 'PINCH_INDEX',
	101: 'PINCH_MIDDLE',
	102: 'PINCH_RING',
	103: 'PINCH_PINKY',
	104: 'CHEF_KISS_ALL_PINCHED',
	105: 'OK_SIGN',
	600: 'THUMBS_UP',
	601: 'THUMBS_DOWN'
};
const PREMADE_THEMES = {
	'default': { name: "Dark", bgMain: "#000000", bgCard: "#121212", bubble: "#4f46e5", btn: "#1a1a1a", text: "#e5e5e5" },
	'night': { name: "Night Mode 🌚", bgMain: "#000000", bgCard: "#000000", bubble: "#000000", btn: "#000000", text: "#ffffff" },
	'sunlight': { name: "Sunlight ☀️", bgMain: "#e8e8e2", bgCard: "#ffffff", bubble: "#d97706", btn: "#d6d3c7", text: "#000000" },
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
const PREMADE_VOICE_PRESETS = {
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
			'k9_1': '12', 'k9_2': '18', 'k9_3': '20', 'k9_4': '32', 'k9_5': '36',
			'k9_6': '56', 'k9_7': '105', 'k9_8': '104', 'k9_9': '600'
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
			'k12_1': '0', 'k12_2': '18', 'k12_3': '32', 'k12_4': '40', 'k12_5': '56',
			'k12_6': '60', 'k12_7': '101', 'k12_8': '102', 'k12_9': '103',
			'k12_10': '104', 'k12_11': '105', 'k12_12': '601'
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
			'piano_C': '0', 'piano_D': '18', 'piano_E': '32', 'piano_F': '40', 'piano_G': '56',
			'piano_A': '60', 'piano_B': '101',
			'piano_1': '102', 'piano_2': '103', 'piano_3': '104', 'piano_4': '105', 'piano_5': '601'
		}
	}
};
const GESTURE_CATEGORIES = {
	'Anchors': [
		'anchor_tap_2f', 'anchor_swipe_up_2f', 'anchor_swipe_down_2f', 'anchor_swipe_left_2f', 'anchor_swipe_right_2f',
		'anchor_swipe_nw_2f', 'anchor_swipe_ne_2f', 'anchor_swipe_sw_2f', 'anchor_swipe_se_2f'
	],
	'Chords': [
		'chord_down_left_2f', 'chord_down_ne_2f', 'chord_down_nw_2f', 'chord_down_right_2f', 'chord_down_se_2f', 'chord_down_sw_2f', 'chord_down_tap_2f',
		'chord_left_ne_2f', 'chord_left_nw_2f', 'chord_left_se_2f', 'chord_left_sw_2f', 'chord_left_tap_2f', 'chord_left_up_2f',
		'chord_ne_nw_2f', 'chord_ne_right_2f', 'chord_ne_se_2f', 'chord_ne_tap_2f', 'chord_ne_up_2f',
		'chord_nw_right_2f', 'chord_nw_sw_2f', 'chord_nw_tap_2f', 'chord_nw_up_2f',
		'chord_right_se_2f', 'chord_right_sw_2f', 'chord_right_tap_2f', 'chord_right_up_2f',
		'chord_se_sw_2f', 'chord_se_tap_2f', 'chord_se_up_2f',
		'chord_sw_tap_2f', 'chord_sw_up_2f',
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
		'tap_2f_any', 'tap_2f_vertical', 'tap_2f_horizontal', 'tap_2f_diagonal_se', 'tap_2f_diagonal_sw',
		'double_tap_2f_any', 'double_tap_2f_vertical', 'double_tap_2f_horizontal', 'double_tap_2f_diagonal_se', 'double_tap_2f_diagonal_sw',
		'triple_tap_2f_any', 'triple_tap_2f_vertical', 'triple_tap_2f_horizontal', 'triple_tap_2f_diagonal_se', 'triple_tap_2f_diagonal_sw',
		'long_tap_2f_any', 'long_tap_2f_vertical', 'long_tap_2f_horizontal', 'long_tap_2f_diagonal_se', 'long_tap_2f_diagonal_sw',
		'tap_3f_any', 'tap_3f_vertical', 'tap_3f_horizontal', 'tap_3f_diagonal_se', 'tap_3f_diagonal_sw',
		'double_tap_3f_any', 'double_tap_3f_vertical', 'double_tap_3f_horizontal', 'double_tap_3f_diagonal_se', 'double_tap_3f_diagonal_sw',
		'triple_tap_3f_any', 'triple_tap_3f_vertical', 'triple_tap_3f_horizontal', 'triple_tap_3f_diagonal_se', 'triple_tap_3f_diagonal_sw',
		'long_tap_3f_any', 'long_tap_3f_vertical', 'long_tap_3f_horizontal', 'long_tap_3f_diagonal_se', 'long_tap_3f_diagonal_sw'
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
		'zigzag_any', 'zigzag_up', 'zigzag_down', 'zigzag_left', 'zigzag_right', 'zigzag_nw', 'zigzag_ne', 'zigzag_sw', 'zigzag_se',
		'long_zigzag_any', 'long_zigzag_up', 'long_zigzag_down', 'long_zigzag_left', 'long_zigzag_right', 'long_zigzag_nw', 'long_zigzag_ne', 'long_zigzag_sw', 'long_zigzag_se'
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
			'k9_4': 'tap_2f_any', 'k9_5': 'double_tap_2f_any', 'k9_6': 'triple_tap_2f_any',
			'k9_7': 'tap_3f_any', 'k9_8': 'double_tap_3f_any', 'k9_9': 'triple_tap_3f_any'
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
			'k12_5': 'tap_2f_any', 'k12_6': 'double_tap_2f_any', 'k12_7': 'triple_tap_2f_any', 'k12_8': 'long_tap_2f_any',
			'k12_9': 'tap_3f_any', 'k12_10': 'double_tap_3f_any', 'k12_11': 'triple_tap_3f_any', 'k12_12': 'long_tap_3f_any'
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
			'k12_9': 'tap_2f_any', 'k12_10': 'double_tap_2f_any', 'k12_11': 'tap_3f_any', 'k12_12': 'double_tap_3f_any'
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
			'piano_C': 'tap_2f_any', 'piano_D': 'double_tap_2f_any', 'piano_E': 'triple_tap_2f_any', 'piano_F': 'long_tap_2f_any',
			'piano_G': 'tap_3f_any', 'piano_A': 'double_tap_3f_any', 'piano_B': 'triple_tap_3f_any',
			'piano_1': 'swipe_up_2f', 'piano_2': 'swipe_down_2f', 'piano_3': 'swipe_left_2f',
			'piano_4': 'swipe_right_2f', 'piano_5': 'long_tap_3f_any'
		}
	}
};
const CRAYONS = [
  "#000000", "#1F75FE", "#1CA9C9", "#0D98BA", "#FFFFFF", "#C5D0E6", 
  "#B0B7C6", "#AF4035", "#F5F5F5", "#FEFEFA", "#FFFAFA", "#F0F8FF", 
  "#F8F8FF", "#F5F5DC", "#FFFACD", "#FAFAD2", "#FFFFE0", "#FFFFF0", 
  "#FFFF00", "#FFEFD5", "#FFE4B5", "#FFDAB9", "#EEE8AA", "#F0E68C", 
  "#BDB76B", "#E6E6FA", "#D8BFD8", "#DDA0DD", "#EE82EE", "#DA70D6", 
  "#FF00FF", "#BA55D3", "#9370DB", "#8A2BE2", "#9400D3", "#9932CC", 
  "#8B008B", "#800000", "#4B0082", "#483D8B", "#6A5ACD", "#7B68EE", 
  "#ADFF2F", "#7FFF00", "#7CFC00", "#00FF00", "#32CD32", "#98FB98", 
  "#90EE90", "#00FA9A", "#00FF7F", "#3CB371", "#2E8B57", "#228B22", 
  "#008000", "#006400", "#9ACD32", "#6B8E23", "#808000", "#556B2F", 
  "#66CDAA", "#8FBC8F", "#20B2AA", "#008B8B", "#008080", "#00FFFF", 
  "#00CED1", "#40E0D0", "#48D1CC", "#AFEEEE", "#7FFFD4", "#B0E0E6", 
  "#5F9EA0", "#4682B4", "#6495ED", "#00BFFF", "#1E90FF", "#ADD8E6", 
  "#87CEEB", "#87CEFA", "#191970", "#000080", "#0000FF", "#0000CD", 
  "#4169E1", "#FFE4C4", "#FFEBCD", "#F5DEB3", "#DEB887", "#D2B48C", 
  "#BC8F8F", "#F4A460", "#DAA520", "#B8860B", "#CD853F", "#D2691E", 
  "#8B4513", "#A0522D", "#A52A2A", "#FFA07A", "#FA8072", "#E9967A", 
  "#F08080", "#CD5C5C", "#DC143C", "#B22222", "#FF0000", "#FF4500", 
  "#FF6347", "#FF7F50", "#FF8C00", "#FFA500", "#FFD700", "#999999", 
  "#808080", "#666666", "#333333", "#222222", "#111111", "#0A0A0A"
];
const DEFAULT_HEADER_BTN_ORDER = [
    'headertimerbtn', 'headercounterbtn','headervoicebtn',
    'headertonebtn', 'headertouchbtn', 'headerhandbtn',
    'headerarcambtn', 'headerbiggerbtn', 'headerfullscreenbtn',
    'headerpinnedbtn', 'headerdndbtn', 'headerupsidedownbtn',
    'headerportraitlockbtn', 'headerlandscapelockbtn', 'headerswapbtn', 'headerplaybtn',
    'headerdeletebtn', 'headerundobtn', 'headersettingsbtn', 'headerhelpbtn',
    'headermodeswitchbtn', 'headerredeembtn', 'headersharebtn',
    'headerthemecyclebtn', 'headeraddmachinebtn', 'headeruiupbtn',
    'headeruidownbtn', 'headersequpbtn', 'headerseqdownbtn',
    'headervolupbtn', 'headervoldownbtn', 'headerspeedupbtn',
    'headerspeeddownbtn', 'headercycleinputbtn',
    'headernotepadbtn', 'headerpipbtn', 'headerresetbtn', 'headernukebtn'
];
const DEFAULT_GENERAL_TOGGLE_ORDER = [
'autoBrightToggle', 'autoDarkToggle',
'randomThemeToggle', 'headerThemeCycleToggle',
'headerCycleInputToggle', 'headerModeSwitchToggle',
'headerAddMachineToggle', 'bossToggle',
'headerUiSizeToggle', 'headerSeqSizeToggle',
'headerVolumeToggle', 'headerSpeedToggle',
'autoHideHeaderToggle', 'headerInfiniteScrollToggle',
'flickHeaderToggle', 'restoreHeaderToggle',
'headerPlayToggle', 'headerDeleteToggle', 
'headerSettingsToggle', 'headerHelpToggle', 
'headerRedeemToggle', 'headerShareToggle',
'hideIntroToggle', 'headerUndoToggle',
'timerToggle', 'autotimerToggle',
'counterToggle', 'autocounterToggle',
'headerNotepadToggle', 'inputRegulatorToggle',
'hapticsToggle',
'upsidedownToggle', 'portraitLockToggle', 'landscapeLockToggle',
'fullscreenToggle', 'biggerToggle',
'ecoToggle', 'wakelockToggle',
'positionSwapToggle', 'landscapeInputResizeToggle', 'pipToggle',
'dndToggle', 'pinnedModeToggle',
'arcamToggle', 'arAutoCloseGeneralToggle',
'voiceToggle', 'voicecommandsToggle',
'toneToggle', 'touchToggle',
'handToggle', 'skeletonDebugToggle',
'handsignalsToggle', 'handednessFlipToggle',
'volgesToggle', 'speedToggle',
'headerResetToggle', 'headerNukeToggle'
];
const CONFIG = {
	MAX_MACHINES: 4,
	DEMO_DELAY_BASE_MS: 798,
	SPEED_DELETE_DELAY: 250,
	SPEED_DELETE_INTERVAL: 20,
	STORAGE_KEY_SETTINGS: 'followMeAppSettings_v47',
	STORAGE_KEY_STATE: 'followMeAppState_v48',
	INPUTS: {
		KEY9: 'key9',
		KEY12: 'key12',
		PIANO: 'piano'
	},
	MODES: {
		SIMON: 'simon',
		UNIQUE_ROUNDS: 'unique'
	}
};
const DEFAULT_PROFILE_SETTINGS = {
	currentInput: CONFIG.INPUTS.KEY9,
	currentMode: CONFIG.MODES.SIMON,
	sequenceLength: 20,
	machineCount: 1,
	simonChunkSize: 40,
	simonInterSequenceDelay: 200,
	isUniqueRoundsAutoClearEnabled: true,
	isPracticeModeEnabled: false,
	isAutoplayEnabled: false,
	isFlashEnabled: false,
	isAudioEnabled: false,
	isHapticMorseEnabled: false,
	playbackSpeed: 1.0,
	pauseSetting: 200,
	voicePitch: 1.0,
	voiceRate: 1.0,
	voiceVolume: 1.0,
	selectedVoice: null,
	voicePresets: {},
	activeVoicePresetId: 'standard'
};
const PREMADE_PROFILES = {
	'profile_1': {
		name: "Follow Me",
		settings: {
			...DEFAULT_PROFILE_SETTINGS
		},
		theme: 'default'
	},
	'profile_2': {
		name: "2 Machines",
		settings: {
			...DEFAULT_PROFILE_SETTINGS,
			machineCount: 2,
			simonChunkSize: 40,
			simonInterSequenceDelay: 200
		},
		theme: 'default'
	},
	'profile_3': {
		name: "Bananas",
		settings: {
			...DEFAULT_PROFILE_SETTINGS,
			sequenceLength: 25
		},
		theme: 'default'
	},
	'profile_4': {
		name: "Piano",
		settings: {
			...DEFAULT_PROFILE_SETTINGS,
			currentInput: CONFIG.INPUTS.PIANO
		},
		theme: 'default'
	},
	'profile_5': {
		name: "15 Rounds",
		settings: {
			...DEFAULT_PROFILE_SETTINGS,
			currentMode: CONFIG.MODES.UNIQUE_ROUNDS,
			sequenceLength: 15,
			currentInput: CONFIG.INPUTS.KEY12
		},
		theme: 'default'
	}
};
const DEFAULT_APP = {
	globalUiScale: 100,
	uiScaleMultiplier: 2.2, // Executed: Portrait scaling multiplier
	showWelcomeScreen: true,
	touchResizeMode: 'none',
	playbackSpeed: 1.0,
	isAutoplayEnabled: false,
	isUniqueRoundsAutoClearEnabled: true,
	isAudioEnabled: false,
	isHapticsEnabled: false,
	isFlashEnabled: false,
	pauseSetting: 200,
	isSpeedDeletingEnabled: true,
	isSpeedTouchGesturesEnabled: false,
	isVolumeTouchGesturesEnabled: false,
	isArModeEnabled: false,
	isArAutoCloseEnabled: false,
	isVoiceInputEnabled: false,
	arPlaybackSpeed: 1.00,
	voiceTriggerWord: 'set',
	isDeleteTouchGestureEnabled: true,
	isClearTouchGestureEnabled: true,
	isAutoTimerEnabled: false,
	isAutoCounterEnabled: false,
	isWakeLockEnabled: false,
	isDndEnabled: false,
	isPinnedModeEnabled: false,
	showHeaderUndoBtn: false,
	showHeaderLandscapeLockBtn: false,
	lastSequence: null,
	isEcoModeEnabled: false,
	isLongPressAutoplayEnabled: true,
	showBiggerBtn: false,
	activeTheme: 'default',
	customThemes: {},
	isRandomThemeEnabled: false,
	isBossModeEnabled: false,
	isHapticMorseEnabled: false,
	showTimer: false,
    isFlickHeaderEnabled: false,
    isRestoreHeaderGestureEnabled: false, 
	showCounter: false,
	isHandGesturesEnabled: false,
	isHandSignalsEnabled: false,
	handednessFlip: false,
	showHeaderPlayBtn: false,
	showHeaderDeleteBtn: false,
	showHeaderSettingsBtn: false,
	showHeaderRedeemBtn: false,
	showHeaderShareBtn: false,
	showHeaderThemeCycleBtn: false,
	showHeaderAddMachineBtn: false,
	showHeaderUiSizeBtns: false,
	showHeaderSeqSizeBtns: false,
	showHeaderVolumeBtns: false,
	showHeaderSpeedBtns: false,
	showHeaderCycleInputBtn: false,
	showHeaderNotepadBtn: false,
	showHeaderHelpBtn: false,
	showHeaderModeSwitchBtn: false,
	showHeaderResetBtn: false,
	showHeaderNukeBtn: false,
	notepadText: '',
	isVoiceCommandsEnabled: false,
	isToneCadenceEnabled: false,
	isInputRegulatorEnabled: false,
	isAutoHideHeaderEnabled: false,
	isHeaderInfiniteScrollEnabled: false,
	isAutoBrightEnabled: false,
	isAutoDarkEnabled: false,
	headerIconScale: 100,
	appFontScale: 100,
	appInputFontScale: 200,
	appInputBtnScale: 100,
	appRowMax: '5',
	// Every bucket now carries its OWN inputAreaEnabled/inputAreaPct instead of leaving some of
	// them undefined - an undefined value made getEffectiveInputAreaEnabled()/Pct() silently fall
	// back to the GLOBAL Adjust Input Area toggle/percentage (General/UI tab) for that bucket,
	// which is exactly what made per-bucket lists look like they "didn't work" - the bucket's own
	// saved value existed but was never being read because the fallback got there first only for
	// the buckets missing this key. landscape/split66/split50h default to off (matching prior
	// real-world behavior) so nothing changes visually for people already using them; split50v
	// and split33 are turned on with the percentages that actually make each pane usable - 50v is
	// a short, full-width stacked pane so the input pad needs most of the height (80%), while
	// split33's side-by-side pane is wide-open vertically but very narrow horizontally, so the
	// input strip only needs a sliver (20%) and the sequence display gets the rest.
	// headerPadding/inputsPadding: same independence as everything else here - the UI tab's own
	// Header Padding/Inputs Padding dropdowns (headerPadding/inputsPadding below, outside this
	// object) are Portrait's values specifically, not a global fallback for every bucket. Each
	// bucket gets its own copy, defaulting to 0 (matching the prior shared default) so nothing
	// changes for anyone not using it, adjustable per-bucket from here on via Configure Viewport.
	viewportProfiles: {
		landscape: { uiScale: 100, seqSize: 210, headerScale: 100, numberSize: 250, inputFontSize: 200, btnSize: 150, rowMax: '5', inputAreaEnabled: true, inputAreaPct: 35, headerPadding: 0, inputsPadding: 0, headerButtons: [] }, // Executed: sequence size & row bounds
		split66: { uiScale: 100, seqSize: 180, headerScale: 100, numberSize: 250, inputFontSize: 100, btnSize: 100, rowMax: '5', inputAreaEnabled: false, inputAreaPct: 50, headerPadding: 0, inputsPadding: 0, headerButtons: [] },
		split50v: { uiScale: 100, seqSize: 100, headerScale: 100, numberSize: 250, inputFontSize: 100, btnSize: 100, rowMax: '5', alignment: 'horizontal', inputAreaEnabled: true, inputAreaPct: 80, headerPadding: 0, inputsPadding: 0, headerButtons: ['timer', 'counter', 'play', 'delete', 'bigger', 'swap', 'pip', 'touch'] }, // Executed: flex-direction fixed
		split50h: { uiScale: 100, seqSize: 100, headerScale: 100, numberSize: 250, inputFontSize: 100, btnSize: 100, rowMax: '5', alignment: 'horizontal', inputAreaEnabled: false, inputAreaPct: 50, headerPadding: 0, inputsPadding: 0, headerButtons: ['timer', 'counter', 'play', 'delete', 'bigger', 'swap', 'pip', 'touch'] },
		split33: { uiScale: 100, seqSize: 100, headerScale: 100, numberSize: 250, inputFontSize: 100, btnSize: 100, rowMax: '5', inputAreaEnabled: true, inputAreaPct: 20, headerPadding: 0, inputsPadding: 0, headerButtons: ['timer', 'counter', 'play', 'delete', 'bigger', 'swap', 'pip', 'touch'] } // Executed: custom piano sizing metrics mapped
	},
	pipMachineIndex: null,
	ecoModeConfig: {
        
		themeSwitch: false, ecoTheme: 'night',
		limitWakeLock: false, wakeLockLimitSeconds: 300,
		disableAmbientSensor: false, // ambient light sensor polls continuously for Auto Bright/Auto Dark - proximity sensor already has its own independent eco-mode awareness elsewhere and isn't affected by this
		cameraQuality: 'full', // 'low' | 'medium' | 'full' - caps getUserMedia resolution/frameRate for AR camera, hand tracking, pitch detection mic
		hapticsLevel: 'normal', // 'off' | 'light' | 'normal' - real navigator.vibrate() duration
		volumePct: 100, // 10-100, scales the real GainNode output and speech synthesis volume
		screenDimPct: 0 // 0-60, real CSS overlay dim - the web platform has no API to control actual hardware brightness
	},
	savedFullProfiles: {},
	headerPadding: 0,
	inputsPadding: 0,
	toneCalibration: {isCalibrated: false,notes: {}},
	isPositionSwapEnabled: false,
	isLandscapeInputResizeEnabled: false,
	landscapeInputWidthPct: 50,
	portraitInputHeightPct: 40,
	isSkeletonDebugEnabled: false,
	activeFontFamily: "'Inter', sans-serif",
	handGestureCooldown: 600,
	handHoldFrames: 4,
	voiceConfidenceThreshold: 50,
	toneVolumeThreshold: -85,
	isSliderLockEnabled: true,
	isSettingsLockEnabled: false,
	touchAnchorStillDistance: 15,
	touchAnchorMinHoldTime: 150,
	touchChordSimultaneityWindow: 50,
	showFullscreenBtn: false,
	showPinnedBtn: false,
	showDndBtn: false,
	showPipBtn: false,
	showUpsideDownBtn: false,
	showPortraitLockBtn: false,
	uiFontSizeMultiplier: 2.5,
	activeProfileId: 'profile_1',
	profiles: JSON.parse(JSON.stringify(PREMADE_PROFILES)),
	runtimeSettings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)),
	isPracticeModeEnabled: false,
	voicePitch: 1.0,
	voiceRate: 1.0,
	voiceVolume: 1.0,
	selectedVoice: null,
	voicePresets: {},
	activeVoicePresetId: 'standard',
	isTouchGestureInputEnabled: false,
	touchGestureMappings: {
		'k9_1': { gesture: 'Double_tap_spatial_nw' },
		'k9_2': { gesture: 'Double_tap_spatial_up' },
		'k9_3': { gesture: 'Double_tap_spatial_ne' },
		'k9_4': { gesture: 'Double_tap_spatial_left' },
		'k9_5': { gesture: 'double_tap' },
		'k9_6': { gesture: 'Double_tap_spatial_right' },
		'k9_7': { gesture: 'Double_tap_spatial_sw' },
		'k9_8': { gesture: 'Double_tap_spatial_down' },
		'k9_9': { gesture: 'Double_tap_spatial_se' },
		'k12_1': { gesture: 'tap' },
		'k12_2': { gesture: 'double_tap' },
		'k12_3': { gesture: 'triple_tap' },
		'k12_4': { gesture: 'long_tap' },
		'k12_5': { gesture: 'tap_2f_any' },
		'k12_6': { gesture: 'double_tap_2f_any' },
		'k12_7': { gesture: 'triple_tap_2f_any' },
		'k12_8': { gesture: 'long_tap_2f_any' },
		'k12_9': { gesture: 'tap_3f_any' },
		'k12_10': { gesture: 'double_tap_3f_any' },
		'k12_11': { gesture: 'triple_tap_3f_any' },
		'k12_12': { gesture: 'long_tap_3f_any' },
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
	},
	mappings: {'k9_1': { touch: 'none', handGesture: 16, morse: '', handSide: 'any' },'k9_2': { touch: 'none', handGesture: 24, morse: '', handSide: 'any' },'k9_3': { touch: 'none', handGesture: 28, morse: '', handSide: 'any' },'k9_4': { touch: 'none', handGesture: 30, morse: '', handSide: 'any' },'k9_5': { touch: 'none', handGesture: 62, morse: '', handSide: 'any' },'k9_6': { touch: 'none', handGesture: 34, morse: '', handSide: 'any' },'k9_7': { touch: 'none', handGesture: 48, morse: '', handSide: 'any' },'k9_8': { touch: 'none', handGesture: 50, morse: '', handSide: 'any' },'k9_9': { touch: 'none', handGesture: 100, morse: '', handSide: 'any' },'k12_1': { touch: 'none', handGesture: 16, morse: '', handSide: 'any' },'k12_2': { touch: 'none', handGesture: 24, morse: '', handSide: 'any' },'k12_3': { touch: 'none', handGesture: 28, morse: '', handSide: 'any' },'k12_4': { touch: 'none', handGesture: 30, morse: '', handSide: 'any' },'k12_5': { touch: 'none', handGesture: 62, morse: '', handSide: 'any' },'k12_6': { touch: 'none', handGesture: 34, morse: '', handSide: 'any' },'k12_7': { touch: 'none', handGesture: 48, morse: '', handSide: 'any' },'k12_8': { touch: 'none', handGesture: 50, morse: '', handSide: 'any' },'k12_9': { touch: 'none', handGesture: 100, morse: '', handSide: 'any' },'k12_10': { touch: 'none', handGesture: 12, morse: '', handSide: 'any' },'k12_11': { touch: 'none', handGesture: 20, morse: '', handSide: 'any' },'k12_12': { touch: 'none', handGesture: 36, morse: '', handSide: 'any' },'piano_C': { touch: 'none', handGesture: 16, morse: '', handSide: 'any' },'piano_D': { touch: 'none', handGesture: 24, morse: '', handSide: 'any' },'piano_E': { touch: 'none', handGesture: 28, morse: '', handSide: 'any' },'piano_F': { touch: 'none', handGesture: 30, morse: '', handSide: 'any' },'piano_G': { touch: 'none', handGesture: 62, morse: '', handSide: 'any' },'piano_A': { touch: 'none', handGesture: 34, morse: '', handSide: 'any' },'piano_B': { touch: 'none', handGesture: 48, morse: '', handSide: 'any' },'piano_1': { touch: 'none', handGesture: 50, morse: '', handSide: 'any' },'piano_2': { touch: 'none', handGesture: 100, morse: '', handSide: 'any' },'piano_3': { touch: 'none', handGesture: 12, morse: '', handSide: 'any' },'piano_4': { touch: 'none', handGesture: 20, morse: '', handSide: 'any' },'piano_5': { touch: 'none', handGesture: 36, morse: '', handSide: 'any' }},
	activeGestureFilters: ['Poses','Pinches','Counts','Shapes','Motion','Transitions','Combos','Anchors','Chords','Taps','Spatial Taps','Multi-Finger Taps','Swipes','Long Swipes','Multi-Finger Swipes','Boomerangs','Switchbacks','Zigzags','Corners & Shapes','Motion Gestures','Flicks','Pausing Curves'],
	customTouchPresets: {},
	customHandPresets: {},
	activeMappingPreset: {'touch-preset-key9-select': '9_spatial','touch-preset-key12-select': '12_taps'},
	headerBtnOrder: [
    'headertimerbtn', 'headercounterbtn','headervoicebtn',
    'headertonebtn', 'headertouchbtn', 'headerhandbtn',
    'headerarcambtn', 'headerbiggerbtn', 'headerfullscreenbtn',
    'headerpinnedbtn', 'headerdndbtn', 'headerupsidedownbtn',
    'headerportraitlockbtn', 'headerlandscapelockbtn', 'headerswapbtn', 'headerplaybtn',
    'headerdeletebtn', 'headerundobtn', 'headersettingsbtn', 'headerhelpbtn',
    'headermodeswitchbtn', 'headerredeembtn', 'headersharebtn',
    'headerthemecyclebtn', 'headeraddmachinebtn', 'headeruiupbtn',
    'headeruidownbtn', 'headersequpbtn', 'headerseqdownbtn',
    'headervolupbtn', 'headervoldownbtn', 'headerspeedupbtn',
    'headerspeeddownbtn', 'headercycleinputbtn',
    'headernotepadbtn', 'headerpipbtn', 'headerresetbtn', 'headernukebtn'
	],
	generalToggleOrder: ['autoBrightToggle', 'autoDarkToggle', 'randomThemeToggle', 'headerThemeCycleToggle','headerCycleInputToggle', 'headerModeSwitchToggle','headerAddMachineToggle', 'bossToggle','headerUiSizeToggle', 'headerSeqSizeToggle','headerVolumeToggle', 'headerSpeedToggle','autoHideHeaderToggle', 'headerInfiniteScrollToggle','flickHeaderToggle', 'restoreHeaderToggle','headerPlayToggle', 'headerDeleteToggle', 
'headerSettingsToggle', 'headerHelpToggle', 
'headerRedeemToggle', 'headerShareToggle',
'hideIntroToggle', 'headerUndoToggle',
'timerToggle', 'autotimerToggle',
'counterToggle', 'autocounterToggle',
'headerNotepadToggle', 'inputRegulatorToggle',
'hapticsToggle',
'upsidedownToggle', 'portraitLockToggle', 'landscapeLockToggle',
'fullscreenToggle', 'biggerToggle',
'ecoToggle', 'wakelockToggle',
'positionSwapToggle', 'landscapeInputResizeToggle', 'pipToggle',
'dndToggle', 'pinnedModeToggle',
'arcamToggle', 'arAutoCloseGeneralToggle',
'voiceToggle', 'voicecommandsToggle',
'toneToggle', 'touchToggle',
'handToggle', 'skeletonDebugToggle',
'handsignalsToggle', 'handednessFlipToggle',
'volgesToggle', 'speedToggle',
'headerResetToggle', 'headerNukeToggle'
	]
};
const SETTINGS_PRESETS = [
	{ id: 'default', name: 'Default', code: 'm.xmhNj`V-16N$xovQJJ^`qG9_Wn:' },
	{ id: 'preset1', name: 'Average', code: '5n.2^vd*4{b#^B^6m4$:r(B84$J;7%7;*g/NM0q?Ee1%%Ix$=-HWxjF5kl2p?5LClV:jeQqI2.cJ`YpZ)7o^!UEQeaJjq9Yc8])9ZYq13oTmx=^d%LI2wP{@goa@RQaMmg3J`^qsc)0xF*LSyv`%?9hM}8chT2{H?R?9E{09+tR+-5M8@@_u-ZtitI$[QJ)XB0uMIM8V$MJRtZ}wJtd1g=j7!Dp}x-pvoQ((}AKP$],1dg2PvX7hQd=`ts_1(b:m' }
];
const DEFAULT_MAPPINGS = {
	'k9_1': 'tap',
	'k9_2': 'double_tap',
	'k9_3': 'triple_tap',
	'k9_4': 'tap_2f_any',
	'k9_5': 'double_tap_2f_any',
	'k9_6': 'triple_tap_2f_any',
	'k9_7': 'tap_3f_any',
	'k9_8': 'double_tap_3f_any',
	'k9_9': 'triple_tap_3f_any',
	'k12_1': 'tap',
	'k12_2': 'double_tap',
	'k12_3': 'triple_tap',
	'k12_4': 'long_tap',
	'k12_5': 'tap_2f_any',
	'k12_6': 'double_tap_2f_any',
	'k12_7': 'triple_tap_2f_any',
	'k12_8': 'long_tap_2f_any',
	'k12_9': 'tap_3f_any',
	'k12_10': 'double_tap_3f_any',
	'k12_11': 'triple_tap_3f_any',
	'k12_12': 'long_tap_3f_any',
	'piano_C': 'swipe_nw',
	'piano_D': 'swipe_left',
	'piano_E': 'swipe_sw',
	'piano_F': 'swipe_down',
	'piano_G': 'swipe_se',
	'piano_A': 'swipe_right',
	'piano_B': 'swipe_ne',
	'piano_1': 'swipe_left_2f',
	'piano_2': 'swipe_nw_2f',
	'piano_3': 'swipe_up_2f',
	'piano_4': 'swipe_ne_2f',
	'piano_5': 'swipe_right_2f'
};
const BACKUP_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%()*+,-./:;=?@[]^_`{}';
const AMBIENT_LIGHT_NIGHT_LUX = 5;
const AMBIENT_LIGHT_SUNLIGHT_LUX = 4000;
const _MODAL_IDS = ['settings-modal', 'help-modal', 'share-modal', 'comment-modal', 'redeem-modal', 'donate-modal', 'theme-editor-modal', 'game-setup-modal'];
const firebaseConfig = {
	apiKey: "AIzaSyCsXv-YfziJVtZ8sSraitLevSde51gEUN4",
	authDomain: "follow-me-app-de3e9.firebaseapp.com",
	projectId: "follow-me-app-de3e9",
	storageBucket: "follow-me-app-de3e9.firebasestorage.app",
	messagingSenderId: "957006680126",
	appId: "1:957006680126:web:6d679717d9277fd9ae816f"
};
const arRecordBtn = document.getElementById('ar-record-btn');
const arPlaybackContainer = document.getElementById('ar-playback-container');
const arPlaybackVideo = document.getElementById('ar-playback-video');
const arBackgroundVideo = document.getElementById('ar-background-video');let db = null;
let screenWakeLock = null;
let appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
let appState = {};
let modules = {
	settings: null,
	vision: null,
	touchGestureEngine: null
};
let timers = {
	speedDelete: null,
	initialDelay: null,
	longPress: null,
	settingsLongPress: null,
	playback: null,
	tap: null
};
let touchGestureState = {
	startDist: 0,
	startScale: 1,
	isPinching: false
};
let bossState = {
	isActive: false,
	lastShake: 0
};
let isDemoPlaying = false;
let isPlaybackPaused = false;
let playbackResumeCallback = null;
let practiceSequence = [];
let practiceInputIndex = 0;
let lastMachineInputTime = {};
let ignoreNextClick = false;
let voiceModule = null;
let isTouchGesturePadVisible = false;
// Real touchscreens fire both a real 'touchstart'/'touchend' AND a synthetic compatibility
// 'mousedown'/'mouseup' for the same physical tap (the browser's legacy mouse-event emulation
// layer exists so code that only listens for mouse events still works on touch devices - it can
// fire even when the touch handler calls preventDefault(), depending on browser/OS). Any element
// with both a touch and a mouse listener calling the same handler needs this guard, or every tap
// on a real device double-fires. Not needed on elements that only bind one event type.
function dedupeTouchMouseHandler(fn, windowMs = 400) {
	let lastFiredAt = 0;
	return function guarded(e) {
		const now = Date.now();
		if (now - lastFiredAt < windowMs) return;
		lastFiredAt = now;
		return fn.apply(this, arguments);
	};
}
let simpleTimer = {
	interval: null,
	startTime: 0,
	elapsed: 0,
	isRunning: false
};
let simpleCounter = 0;
let globalTimerActions = {
	start: null,
	stop: null,
	reset: null
};
let globalCounterActions = {
	increment: null,
	reset: null
};
const getProfileSettings = () => appSettings.runtimeSettings;
const getState = () => appState['current_session'] || (appState['current_session'] = {
		sequences: Array.from({
				length: CONFIG.MAX_MACHINES
			}, () => []),
		nextSequenceIndex: 0,
		currentRound: 1
});
let _savedScrollY = 0;
let _scrollLocked = false;
let ambientLightSensor = null;
let proximitySensor = null;
let isPortraitLocked = false;
let isLandscapeLocked = false;
let lastSquiggleDeleteSnapshotTime = 0;
let pipCanvas = null, pipVideo = null, pipStream = null, pipTimer = null;
let pinnedPopHandler = null;
let pinnedFullscreenRearm = null;
class TouchGestureEngine {
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
				anchorStillDistance: 15,
				anchorMinHoldTime: 150,
				chordSimultaneityWindow: 50,
				pauseDwellRadius: 22,
				pauseDwellTime: 400,
				debug: false
			}, config || {});
		this.callbacks = Object.assign({
				onTouchGesture: (data) => console.log('Gesture:', data),
				onContinuous: (data) => console.log('Continuous:', data),
				onDebug: (msg) => {}
			}, callbacks || {});
		this.activePointers = {};
		this.history = [];
		this.tapStack = { count: 0, fingers: 0, timer: null, posHistory: [], active: false };
		this.allowedTouchGestures = new Set();
		this.contState = {
			rotStartAngle: 0, rotAccumulator: 0, rotLastUpdate: 0, pinchStartDist: 0,
			squiggle: { isTracking: false, startX: 0, lastX: 0, direction: 0, flips: 0, hasTriggered: false },
			squiggle2F: { isTracking: false, lastX: 0, direction: 0, flips: 0, hasTriggered: false }
		};
		this._bindHandlers();
	}
	_cfg(key) {
		const appSettingsKeyMap = {
			tapDelay: 'touchGestureTapDelay',
			swipeThreshold: 'touchGestureSwipeDist',
			longPressTime: 'touchGestureLongPressTime',
			tapPrecision: 'touchGestureTapPrecision',
			spatialThreshold: 'touchGestureSpatialThreshold',
			longSwipeThreshold: 'touchGestureLongSwipeThreshold',
			multiSwipeThreshold: 'touchGestureMultiSwipeThreshold',
			anchorStillDistance: 'touchAnchorStillDistance',
			anchorMinHoldTime: 'touchAnchorMinHoldTime',
			chordSimultaneityWindow: 'touchChordSimultaneityWindow',
			pauseDwellRadius: 'touchPauseDwellRadius',
			pauseDwellTime: 'touchPauseDwellTime',
		};
		const settingKey = appSettingsKeyMap[key];
		if (settingKey && window.appSettings && window.appSettings[settingKey] !== undefined && window.appSettings[settingKey] !== null) {
			return window.appSettings[settingKey];
		}
		return this.config[key];
	}
	updateAllowed(list) {
		this.allowedTouchGestures = new Set(list);
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
		if (e.target.closest && e.target.closest('#header-btn-row')) return;
		this.activePointers[e.pointerId] = {
			id: e.pointerId,
			pts: [{ x: e.clientX, y: e.clientY, t: Date.now() }],
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
		ptr.pts.push({ x: e.clientX, y: e.clientY, t: Date.now() });
		const pointers = Object.values(this.activePointers);
		const count = pointers.length;
		const now = Date.now();
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
		if (count === 2 && this.contState.pinchStartDist > 0) {
			const p1 = pointers[0].pts.slice(-1)[0];
			const p2 = pointers[1].pts.slice(-1)[0];
			const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
			if (Math.abs(dist - this.contState.pinchStartDist) > 20) {
				this.callbacks.onContinuous({ type: 'pinch', scale: dist / this.contState.pinchStartDist });
			}
		}
	}
	_classifySingleFinger(ptr) {
		const pts = ptr.pts;
		const first = pts[0];
		const last = pts[pts.length - 1];
		const dx = last.x - first.x;
		const dy = last.y - first.y;
		const dist = Math.hypot(dx, dy);
		const duration = (ptr.endTime || Date.now()) - ptr.startTime;
		if (dist < this._cfg('anchorStillDistance') && duration >= this._cfg('anchorMinHoldTime')) return { kind: 'still' };
		if (dist < this._cfg('tapPrecision') && duration < this._cfg('longPressTime')) return { kind: 'tap' };
		if (dist > this._cfg('swipeThreshold')) return { kind: 'swipe', dir: this._getDirection(dx, dy) };
		return { kind: 'ambiguous' };
	}
	_tryAnchorOrChord(inputs) {
		if (inputs.length !== 2) return false;
		const sorted = [...inputs].sort((a, b) => a.startTime - b.startTime);
		const first = sorted[0], second = sorted[1];
		const downTimeDelta = second.startTime - first.startTime;
		const c1 = this._classifySingleFinger(first);
		const c2 = this._classifySingleFinger(second);
		if (c1.kind === 'still' && (c2.kind === 'tap' || c2.kind === 'swipe')) {
			if (c2.kind === 'tap') this._emitTouchGesture('anchor', 2, { subMode: 'tap' });
			else this._emitTouchGesture('anchor', 2, { subMode: 'swipe', dir: c2.dir });
			return true;
		}
		const SIMULTANEITY_WINDOW_MS = this._cfg('chordSimultaneityWindow');
		const oppositePairs = { up: 'down', down: 'up', left: 'right', right: 'left', nw: 'se', se: 'nw', ne: 'sw', sw: 'ne' };
		if (downTimeDelta <= SIMULTANEITY_WINDOW_MS && (c1.kind === 'tap' || c1.kind === 'swipe') && (c2.kind === 'tap' || c2.kind === 'swipe')) {
			const label1 = c1.kind === 'tap' ? 'tap' : c1.dir;
			const label2 = c2.kind === 'tap' ? 'tap' : c2.dir;
			const isOppositePair = oppositePairs[label1] === label2;
			if (label1 !== label2 && !isOppositePair) {
				const [a, b] = [label1, label2].sort();
				this._emitTouchGesture('chord', 2, { subMode: `${a}_${b}` });
				return true;
			}
		}
		return false;
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
			this.debounceTimer = setTimeout(() => {
					const inputs = this.history;
					if (this._tryAnchorOrChord(inputs)) {
						this.history = [];
						return;
					}
					this._analyze();
				}, 50);
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
		if (fingers === 2 && pathLen > 40 && netDist > 40) {
			let startSpan = 0, endSpan = 0;
			inputs.forEach(s => { const f = s.pts[0], l = s.pts[s.pts.length-1]; startSpan += Math.hypot(f.x - sc.x, f.y - sc.y); endSpan += Math.hypot(l.x - ec.x, l.y - ec.y); });
			startSpan /= 2; endSpan /= 2;
			if (Math.abs(endSpan - startSpan) > 30) {
				const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
				if (endSpan < startSpan * 0.7) { type = 'pinch_swipe'; meta.dir = dir; }
				else if (endSpan > startSpan * 1.3) { type = 'expand_swipe'; meta.dir = dir; }
				this._emitTouchGesture(type, fingers, meta); return;
			}
		}
		if (type === 'tap' && pathLen > this._cfg('swipeThreshold')) {
			if (segments.length >= 4) {
				const t1 = this._getTurnDir(segments[0].vec, segments[1].vec);
				const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
				const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
				if (alternating) { type = 'long_zigzag'; }
				else if (isClosed) { type = 'square'; meta.winding = winding; }
				else { type = 'long_zigzag'; }
				meta.dir = segments[0].dir;
			}
			else if (segments.length === 3) {
				if (isClosed) { type = 'triangle'; meta.dir = segments[0].dir; meta.winding = winding; }
				else {
					const t1 = this._getTurnDir(segments[0].vec, segments[1].vec);
					const t2 = this._getTurnDir(segments[1].vec, segments[2].vec);
					const alternating = (t1 > 0 && t2 < 0) || (t1 < 0 && t2 > 0);
					if (alternating) {
						const a1 = this._getAngleDiff(segments[0].vec, segments[1].vec);
						const a2 = this._getAngleDiff(segments[1].vec, segments[2].vec);
						if (a1 >= 165 && a2 >= 165) {
							type = 'long_boomerang';
						} else {
							type = 'zigzag';
						}
					}
					else {
						const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
						type = 'u_shape';
						meta.winding = winding;
					}
					meta.dir = segments[0].dir;
				}
			}
			else if (segments.length === 2) {
				meta.dir = segments[0].dir;
				meta.winding = winding;
				const angle = Math.abs(this._getAngleDiff(segments[0].vec, segments[1].vec));
				if (angle >= 165) { type = 'boomerang'; }
				else if (angle > 125) { type = 'switchback'; }
				else { type = 'corner'; }
				if (fingers === 1 && this._hasDwell(primaryPath)) {
					if (type === 'boomerang') { this._emitTouchGesture('Pausing_boomerang', 1, { dir: meta.dir }); return; }
					if (type === 'switchback') { this._emitTouchGesture('Pausing_Switchback', 1, { dir: meta.dir, winding: winding }); return; }
					if (type === 'corner') { this._emitTouchGesture('Pausing_corner', 1, { dir: meta.dir, winding: winding }); return; }
				}
			}
			else {
				const dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
				let threshold = this._cfg('longSwipeThreshold');
				if (dir.length > 2) threshold += 60;
				type = netDist > threshold ? 'swipe_long' : 'swipe';
				meta.dir = dir;
				if (fingers === 1 && this._hasDwell(primaryPath)) {
					this._emitTouchGesture('Pausing_swipe', 1, { dir: dir });
					return;
				}
				if (type === 'swipe' && fingers === 1) {
					const swipeDuration = inputs[0].endTime - inputs[0].startTime;
					if (swipeDuration < 200) {
						this._emitTouchGesture('Flick', fingers, { dir: dir });
						return;
					}
				}
			}
		}
		if (fingers > 1 && type === 'tap' && netDist > this._cfg('multiSwipeThreshold')) {
			type = 'swipe';
			if (segments.length >= 2) {
				const angle = this._getAngleDiff(segments[0].vec, segments[1].vec);
				if (Math.abs(angle) > 150) type = 'boomerang';
			}
			meta.dir = this._getDirection(ec.x - sc.x, ec.y - sc.y);
		}
		if (type === 'tap') {
			const dur = inputs[0].endTime - inputs[0].startTime;
			if (dur > this._cfg('longPressTime')) type = 'long_tap';
			if (fingers > 1) meta.align = this._getAlignment(inputs);
		}
		if (this.tapStack.active) {
			clearTimeout(this.tapStack.timer); this.tapStack.active = false;
			if (type === 'tap' && fingers === this.tapStack.fingers) {
				const seqDist = Math.hypot(sc.x - this.tapStack.lastPos.x, sc.y - this.tapStack.lastPos.y);
				this.tapStack.count++;
				this.tapStack.posHistory.push(ec);
				this.tapStack.lastPos = ec;
				this.tapStack.active = true;
				this.tapStack.timer = setTimeout(() => this._commitStack(), this._cfg('tapDelay'));
				return;
			}
			if (type !== 'tap' && fingers === 1 && this.tapStack.fingers === 1) {
				this._emitTouchGesture('motion_tap', 1, { subMode: type, dir: meta.dir, winding: meta.winding });
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
				timer: setTimeout(() => this._commitStack(), this._cfg('tapDelay'))
			};
			return;
		}
		this._emitTouchGesture(type, fingers, meta);
	}
	_commitStack() {
		const { count, fingers, posHistory, align } = this.tapStack;
		if (count > 0) {
			let maxDist = 0;
			for(let i=1; i<posHistory.length; i++) {
				maxDist = Math.max(maxDist, Math.hypot(posHistory[i].x-posHistory[i-1].x, posHistory[i].y-posHistory[i-1].y));
			}
			if (maxDist > 50 && fingers === 1 && count >= 2) {
				if (count === 2) {
					const dir = this._getDirection(posHistory[1].x - posHistory[0].x, posHistory[1].y - posHistory[0].y);
					this._emitTouchGesture('Double_tap_spatial', 1, { dir: dir });
				} else if (count === 3) {
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
					this._emitTouchGesture('triple_tap', fingers, { subMode: subMode, dir: finalDir });
				}
			} else {
				let type = 'tap';
				if (count === 2) type = 'double_tap';
				if (count === 3) type = 'triple_tap';
				this._emitTouchGesture(type, fingers, { align: align });
			}
			this._clearStack();
		}
	}
	_clearStack() { this.tapStack = { active: false, count: 0, fingers: 0, posHistory: [], timer: null }; }
	_emitTouchGesture(baseType, fingers, meta, overrideName = null) {
		let id = baseType;
		if (meta && meta.subMode) id += '_' + meta.subMode;
		if (meta && meta.dir && meta.dir !== 'Any' && meta.dir !== 'none') id += '_' + meta.dir.toLowerCase();
		const windingShapes = ['corner', 'triangle', 'u_shape', 'square', 'switchback'];
		const checkType = meta && meta.subMode ? meta.subMode : baseType;
		if (meta && meta.winding && windingShapes.some(s => checkType.toLowerCase().includes(s))) id += '_' + meta.winding;
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
		const tryFallback = (candidate) => {
			if (this.allowedTouchGestures && this.allowedTouchGestures.has(candidate)) { finalId = candidate; return true; }
			return false;
		};
		if (this.allowedTouchGestures && this.allowedTouchGestures.size > 0 && !this.allowedTouchGestures.has(finalId)) {
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
			if (!this.allowedTouchGestures.has(finalId)) {
				const dirs = ['_up','_down','_left','_right','_nw','_ne','_sw','_se'];
				for (let d of dirs) {
					if (finalId.includes(d)) {
						let test = finalId.replace(d, '_any');
						if (tryFallback(test)) break;
					}
				}
			}
		}
		if (this.allowedTouchGestures && this.allowedTouchGestures.size > 0 && !this.allowedTouchGestures.has(finalId)) return;
		const name = overrideName || finalId;
		this.callbacks.onTouchGesture({ id: finalId, base: baseType, fingers: fingers, meta: meta, name: name });
	}
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
	_hasDwell(pts) {
		if (!pts || pts.length < 3) return false;
		const DWELL_RADIUS = this._cfg('pauseDwellRadius');
		const DWELL_MS = this._cfg('pauseDwellTime');
		let i = 0;
		while (i < pts.length - 1) {
			let j = i + 1;
			while (j < pts.length &&
				Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y) <= DWELL_RADIUS) {
				if ((pts[j].t - pts[i].t) >= DWELL_MS) return true;
				j++;
			}
			i = (j > i + 1) ? j - 1 : i + 1;
		}
		return false;
	}
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
class HandGestureBuffer {
	constructor(bufferSize = 4) {
		this.buffer = [];
		this.maxSize = bufferSize;
		this.currentLockedHandGesture = null;
		this.lockTime = null;
		this.lockTimeout = 2000;
	}
	pushAndEvaluate(handGestureID) {
		this.maxSize = (window.appSettings && window.appSettings.handHoldFrames) || 4;
		if (handGestureID === null) {
			this.buffer = [];
			this.currentLockedHandGesture = null;
			this.lockTime = null;
			return null;
		}
		this.buffer.push(handGestureID);
		if (this.buffer.length > this.maxSize) {
			this.buffer.shift();
		}
		if (this.buffer.length === this.maxSize && this.buffer.every(val => val === this.buffer[0])) {
			const now = Date.now();
			if (this.currentLockedHandGesture !== this.buffer[0]) {
				this.currentLockedHandGesture = this.buffer[0];
				this.lockTime = now;
			} else if (now - this.lockTime > this.lockTimeout) {
				this.currentLockedHandGesture = null;
				this.lockTime = null;
			}
			return this.currentLockedHandGesture;
		}
		return this.currentLockedHandGesture;
	}
}
class HandMotionTracker {
	constructor() {
		this.pts = [];
		this.windowMs = 900;
		this.minSwipeDist = 0.12;
		this.stillDist = 0.035;
		this.stillTimeMs = 500;
		this.circleBoundRadius = 0.22;
		this.cooldownUntil = 0;
	}
	reset() { this.pts = []; }
	push(x, y) {
		this.minSwipeDist = ((window.appSettings && window.appSettings.handMotionMinDistance) || 12) / 100;
		const now = Date.now();
		this.pts.push({ x, y, t: now });
		while (this.pts.length && now - this.pts[0].t > this.windowMs) this.pts.shift();
		if (now < this.cooldownUntil || this.pts.length < 4) return null;
		if (now - this.pts[0].t < 280) return null;
		const match = this._classify();
		if (match) {
			this.cooldownUntil = now + 600;
			this.pts = [];
		}
		return match;
	}
	_dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
	_pathLength(pts) { let l = 0; for (let i = 1; i < pts.length; i++) l += this._dist(pts[i], pts[i - 1]); return l; }
	_classify() {
		const pts = this.pts;
		const first = pts[0], last = pts[pts.length - 1];
		const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
		const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
		const maxRadius = Math.max(...pts.map(p => Math.hypot(p.x - cx, p.y - cy)));
		const span = last.t - first.t;
		if (maxRadius < this.stillDist && span >= this.stillTimeMs) {
			return { id: 202, label: '⚓ Anchor Hold' };
		}
		const netDx = last.x - first.x;
		const netDy = last.y - first.y;
		const netDist = Math.hypot(netDx, netDy);
		const pathLen = this._pathLength(pts);
		if (pathLen < this.minSwipeDist) return null;
		const horizontal = Math.abs(netDx) >= Math.abs(netDy);
		let flips = 0, lastSign = 0;
		for (let i = 1; i < pts.length; i++) {
			const d = horizontal ? (pts[i].x - pts[i - 1].x) : (pts[i].y - pts[i - 1].y);
			if (Math.abs(d) < 0.015) continue;
			const sign = d > 0 ? 1 : -1;
			if (lastSign !== 0 && sign !== lastSign) flips++;
			lastSign = sign;
		}
		if (flips >= 3) return { id: 201, label: '⚡ Zigzag Motion' };
		let totalTurn = 0, consistentSign = 0, brokeConsistency = false;
		for (let i = 2; i < pts.length; i++) {
			const v1x = pts[i - 1].x - pts[i - 2].x, v1y = pts[i - 1].y - pts[i - 2].y;
			const v2x = pts[i].x - pts[i - 1].x, v2y = pts[i].y - pts[i - 1].y;
			const seg1 = Math.hypot(v1x, v1y), seg2 = Math.hypot(v2x, v2y);
			if (seg1 < 0.004 || seg2 < 0.004) continue;
			const cross = v1x * v2y - v1y * v2x;
			const dot = (v1x * v2x + v1y * v2y) / (seg1 * seg2);
			const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
			if (angle > 140) { brokeConsistency = true; continue; }
			if (angle < 5) continue;
			const sign = cross > 0 ? 1 : -1;
			if (consistentSign !== 0 && sign !== consistentSign) brokeConsistency = true;
			consistentSign = sign;
			totalTurn += angle;
		}
		if (!brokeConsistency && totalTurn >= 300 && maxRadius < this.circleBoundRadius) {
			return { id: 203, label: '🔄 Circular Sweep' };
		}
		if (netDist < this.stillDist * 1.6 && pathLen >= this.minSwipeDist * 1.5) {
			return { id: 200, label: '🪃 Boomerang Pattern' };
		}
		if (!brokeConsistency && totalTurn > 70) return null;
		if (netDist >= this.minSwipeDist && pathLen < netDist * 1.6) {
			if (horizontal) return netDx > 0 ? { id: 303, label: '👉 Swipe Right' } : { id: 302, label: '👈 Swipe Left' };
			return netDy > 0 ? { id: 301, label: '👇 Swipe Down' } : { id: 300, label: '👆 Swipe Up' };
		}
		return null;
	}
}
class VisionEngine {
	constructor(onTrigger, onStatus) {
		this.onTrigger = onTrigger;
		this.onStatus = onStatus;
		this.recognizer = null;
		this.video = null;
		this.isActive = false;
		this.loopId = null;
		this.lastVideoTime = -1;
		this.engineBuffer = new HandGestureBuffer(4);
		this.motionTracker = new HandMotionTracker();
		this.isInitialized = false;
		this.initError = null;
	}
	async start() {
		if (!this.recognizer && !this.isInitialized) {
			this.onStatus("Loading AI (Offline)... 🧠");
			try {
				const { FilesetResolver, GestureRecognizer } = await import("./wasm/vision_bundle.js");
				const vision = await FilesetResolver.forVisionTasks("./wasm");
				this.recognizer = await GestureRecognizer.createFromOptions(vision, {
						baseOptions: {
							modelAssetPath: "./wasm/gesture_recognizer.task",
							delegate: "GPU"
						},
						runningMode: "VIDEO",
						numHands: 2
				});
				this.isInitialized = true;
			} catch (e) {
				console.error("Vision/WASM Init Error:", e.message || e);
				this.initError = e;
				this.isInitialized = false;
				this.onStatus("Hand tracking unavailable ❌");
				return;
			}
		} else if (this.initError) {
			this.onStatus("Hand tracking unavailable ❌");
			return;
		}
		if (this.isActive) return;
		this.video = document.createElement("video");
		this.video.setAttribute("autoplay", "");
		this.video.setAttribute("playsinline", "");
		this.video.style.display = "none";
		document.body.appendChild(this.video);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
					video: getEcoVideoConstraints({ facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } })
			});
			this.video.srcObject = stream;
			this.video.onloadeddata = () => {
				this.isActive = true;
				this.engineBuffer.pushAndEvaluate(null);
				this.predict();
				this.onStatus("Hand Tracking ON 🖐️");
			};
		} catch (e) {
			console.error("Camera Error:", e);
			this.onStatus("Cam Blocked 🚫");
		}
	}
	stop() {
		this.isActive = false;
		if (this.video) {
			if (this.video.srcObject) {
				this.video.srcObject.getTracks().forEach(t => t.stop());
			}
			this.video.remove();
			this.video = null;
		}
		if (this.debugCanvas) {
			this.debugCanvas.remove();
			this.debugCanvas = null;
			this.debugCtx = null;
		}
		if (this.loopId) cancelAnimationFrame(this.loopId);
		this.onStatus("Vision Off 🌑");
	}
	predict() {
		if (!this.isActive || !this.recognizer || !this.video) return;
		const startTimeMs = Date.now();
		if (this.video.currentTime !== this.lastVideoTime) {
			this.lastVideoTime = this.video.currentTime;
			try {
				const results = this.recognizer.recognizeForVideo(this.video, startTimeMs);
				this.process(results);
			} catch(e) {
				console.error("Vision Frame Error", e);
			}
		}
		this.loopId = requestAnimationFrame(() => this.predict());
	}
	process(results) {
		const isDebug = window.appSettings && window.appSettings.isSkeletonDebugEnabled;
		if (isDebug) {
			this._drawDebugSkeleton(results);
		} else if (this.debugCanvas && this.debugCtx) {
			this.debugCtx.clearRect(0, 0, this.debugCanvas.width, this.debugCanvas.height);
		}
		if (results.landmarks && results.landmarks.length === 2) {
			const rawID0 = processHandData(results.landmarks[0]);
			const rawID1 = processHandData(results.landmarks[1]);
			const TWO_HAND_SIGNALS = {
				'62': { id: 'TWO_HAND_STOP', label: '✋✋ Both Palms - Stop' },
				'600': { id: 'TWO_HAND_PLAY', label: '👍👍 Both Thumbs Up - Play' },
				'601': { id: 'TWO_HAND_DELETE', label: '👎👎 Both Thumbs Down - Delete' },
				'0': { id: 'TWO_HAND_CLEAR', label: '✊✊ Both Fists - Clear' },
			};
			if (rawID0 === rawID1 && TWO_HAND_SIGNALS[rawID0]) {
				const signal = TWO_HAND_SIGNALS[rawID0];
				this.onTrigger({ id: signal.id, label: signal.label });
				this._prevStableID = null;
				return;
			}
		}
		if (results.landmarks && results.landmarks.length > 0) {
			const rawID = processHandData(results.landmarks[0]);
			const stableID = this.engineBuffer.pushAndEvaluate(rawID);
			let handSide = null;
			const hArr = results.handednesses || results.handedness;
			if (hArr && hArr[0] && hArr[0][0] && hArr[0][0].categoryName) {
				let name = hArr[0][0].categoryName;
				if (window.appSettings && window.appSettings.handednessFlip) {
					name = name === 'Left' ? 'Right' : 'Left';
				}
				handSide = name === 'Left' ? 'L' : 'R';
			}
			this._lastHandSide = handSide;
			const wrist = results.landmarks[0][0];
			const motionMatch = this.motionTracker.push(wrist.x, wrist.y);
			if (motionMatch) {
				let { id, label } = motionMatch;
				if (window.appSettings && window.appSettings.handednessFlip) {
					if (id === 302) { id = 303; label = '👉 Swipe Right'; }
					else if (id === 303) { id = 302; label = '👈 Swipe Left'; }
				}
				this.onTrigger({ id, label, hand: handSide });
				this._prevStableID = null;
				return;
			}
			if (stableID !== null && GESTURE_DICTIONARY[stableID]) {
				if (this._prevStableID !== null && this._prevStableID !== stableID) {
					const elapsed = Date.now() - (this._prevStableTime || 0);
					const transition = TRANSITION_GESTURES[`${this._prevStableID}->${stableID}`];
					if (transition && elapsed < 900) {
						this.onTrigger({ id: transition.id, label: transition.label });
						this._prevStableID = stableID;
						this._prevStableTime = Date.now();
						return;
					}
				}
				this._prevStableID = stableID;
				this._prevStableTime = Date.now();
				this.onTrigger({
						id: stableID,
						label: GESTURE_DICTIONARY[stableID],
						hand: handSide
				});
				return;
			}
		} else {
			this.engineBuffer.pushAndEvaluate(null);
			this._prevStableID = null;
			this.motionTracker.reset();
		}
		this.onTrigger("none");
	}
	_drawDebugSkeleton(results) {
		if (!this.debugCanvas) {
			this.debugCanvas = document.createElement('canvas');
			this.debugCanvas.style.position = 'fixed';
			this.debugCanvas.style.top = '0';
			this.debugCanvas.style.left = '0';
			this.debugCanvas.style.margin = '0';
			this.debugCanvas.style.width = '100vw';
			this.debugCanvas.style.height = '100vh';
			this.debugCanvas.style.zIndex = '10';
			this.debugCanvas.style.pointerEvents = 'none';
			document.documentElement.appendChild(this.debugCanvas);
			this.debugCtx = this.debugCanvas.getContext('2d');
		}
		const advancedTab = document.getElementById('tab-advanced');
		const isAdvancedTabActive = !!(advancedTab && advancedTab.classList.contains('active'));
		this.debugCanvas.style.display = isAdvancedTabActive ? 'none' : '';
		const ctx = this.debugCtx;
		const canvas = this.debugCanvas;
		if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (!isAdvancedTabActive && results.landmarks) {
			for (const landmarks of results.landmarks) {
				this._drawHand(ctx, landmarks, canvas.width, canvas.height);
			}
		}
		const miniCanvas = document.getElementById('practice-preview-canvas');
		if (miniCanvas) {
			const miniCtx = miniCanvas.getContext('2d');
			const rect = miniCanvas.getBoundingClientRect();
			if (miniCanvas.width !== rect.width || miniCanvas.height !== rect.height) {
				miniCanvas.width = rect.width;
				miniCanvas.height = rect.height;
			}
			miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
			if (results.landmarks) {
				for (const landmarks of results.landmarks) {
					this._drawHand(miniCtx, landmarks, miniCanvas.width, miniCanvas.height);
				}
			}
		}
	}
	_drawHand(ctx, landmarks, w, h) {
		const connectors = [
			[0, 1], [1, 2], [2, 3], [3, 4],
			[0, 5], [5, 6], [6, 7], [7, 8],
			[5, 9], [9, 10], [10, 11], [11, 12],
			[9, 13], [13, 14], [14, 15], [15, 16],
			[13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
		];
		ctx.lineWidth = 3;
		ctx.lineCap = "round";
		ctx.strokeStyle = "#00FF00";
		for (const [start, end] of connectors) {
			const p1 = landmarks[start];
			const p2 = landmarks[end];
			ctx.beginPath();
			ctx.moveTo((1.0 - p1.x) * w, p1.y * h);
			ctx.lineTo((1.0 - p2.x) * w, p2.y * h);
			ctx.stroke();
		}
		ctx.fillStyle = "#FF0000";
		for (const point of landmarks) {
			ctx.beginPath();
			ctx.arc((1.0 - point.x) * w, point.y * h, 4, 0, 2 * Math.PI);
			ctx.fill();
		}
	}
}
class SettingsManager {
	formatTouchGestureLabel(id) {
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
						optionsHTML += `<option value="${id}">${this.formatTouchGestureLabel(id)}</option>`;
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
					opt.textContent = this.formatTouchGestureLabel(currentValue) + ' (filtered)';
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
			headerfullscreenbtn: document.getElementById('headerfullscreenbtn'), headerpinnedbtn: document.getElementById('headerpinnedbtn'), headerdndbtn: document.getElementById('headerdndbtn'), headerpipbtn: document.getElementById('headerpipbtn'),
			headerupsidedownbtn: document.getElementById('headerupsidedownbtn'),
			headerportraitlockbtn: document.getElementById('headerportraitlockbtn'),
			headerlandscapelockbtn: document.getElementById('headerlandscapelockbtn'),
			headerundobtn: document.getElementById('headerundobtn'),
			voicePresetSelect: document.getElementById('voice-preset-select'),
			voicePresetAdd: document.getElementById('voice-preset-add'),
			voicePresetSave: document.getElementById('voice-preset-save'),
			voicePresetRename: document.getElementById('voice-preset-rename'),
			voicePresetDelete: document.getElementById('voice-preset-delete'),
			voicePitch: document.getElementById('voice-pitch'), voiceRate: document.getElementById('voice-rate'), voiceVolume: document.getElementById('voice-volume'), voiceTestBtn: document.getElementById('test-voice-btn'), voiceNameSelect: document.getElementById('voice-name-select'),
			settingsModal: document.getElementById('settings-modal'), themeSelect: document.getElementById('theme-select'), themeAdd: document.getElementById('theme-add'), themeRename: document.getElementById('theme-rename'), themeDelete: document.getElementById('theme-delete'), themeSave: document.getElementById('theme-save'), randomThemeToggle: document.getElementById('randomThemeToggle'), autoHideHeaderToggle: document.getElementById('autoHideHeaderToggle'), skeletonDebugToggle: document.getElementById('skeletonDebugToggle'), fontSelect: document.getElementById('font-select'),
			configSelect: document.getElementById('config-select'), quickConfigSelect: document.getElementById('quick-config-select'), configAdd: document.getElementById('config-add'), configRename: document.getElementById('config-rename'), configDelete: document.getElementById('config-delete'), configSave: document.getElementById('config-save'),
			input: document.getElementById('input-select'), mode: document.getElementById('mode-select'), practiceMode: document.getElementById('practice-mode-toggle'), machines: document.getElementById('machines-select'), seqLength: document.getElementById('seq-length-select'),
			autoClear: document.getElementById('autoclear-toggle'), autoplay: document.getElementById('autoplay-toggle'), flash: document.getElementById('flash-toggle'),
			pause: document.getElementById('pause-select'), audio: document.getElementById('audio-toggle'), hapticMorse: document.getElementById('haptic-morse-toggle'), playbackSpeed: document.getElementById('playback-speed-select'), chunk: document.getElementById('chunk-select'), delay: document.getElementById('delay-select'), haptics: document.getElementById('hapticsToggle'),
			speedTouchGesturesToggle: document.getElementById('speedToggle'),
			volumeTouchGesturesToggle: document.getElementById('volgesToggle'),
			autoTimerToggle: document.getElementById('autotimerToggle'),
			autoCounterToggle: document.getElementById('autocounterToggle'),
			arcamToggle: document.getElementById('arcamToggle'),
			arAutoCloseGeneralToggle: document.getElementById('arAutoCloseGeneralToggle'),
			arAutoClosePlayback: document.getElementById('ar-autoclose-toggle'),
			voiceToggle: document.getElementById('voiceToggle'),
			showWelcome: document.getElementById('hideIntroToggle'),
			bossToggle: document.getElementById('bossToggle'),
			biggerToggle: document.getElementById('biggerToggle'),
			timerToggle: document.getElementById('timerToggle'),
			headerPlayToggle: document.getElementById('headerPlayToggle'), headerDeleteToggle: document.getElementById('headerDeleteToggle'), headerSettingsToggle: document.getElementById('headerSettingsToggle'), headerRedeemToggle: document.getElementById('headerRedeemToggle'), headerShareToggle: document.getElementById('headerShareToggle'), headerThemeCycleToggle: document.getElementById('headerThemeCycleToggle'), headerAddMachineToggle: document.getElementById('headerAddMachineToggle'), headerUiSizeToggle: document.getElementById('headerUiSizeToggle'), headerSeqSizeToggle: document.getElementById('headerSeqSizeToggle'), headerVolumeToggle: document.getElementById('headerVolumeToggle'), headerSpeedToggle: document.getElementById('headerSpeedToggle'), headerCycleInputToggle: document.getElementById('headerCycleInputToggle'),
			headerNotepadToggle: document.getElementById('headerNotepadToggle'), headerHelpToggle: document.getElementById('headerHelpToggle'), headerModeSwitchToggle: document.getElementById('headerModeSwitchToggle'), headerResetToggle: document.getElementById('headerResetToggle'), headerNukeToggle: document.getElementById('headerNukeToggle'), headerInfiniteScrollToggle: document.getElementById('headerInfiniteScrollToggle'), inputRegulatorToggle: document.getElementById('inputRegulatorToggle'),
			counterToggle: document.getElementById('counterToggle'),
			touchGestureToggle: document.getElementById('touchToggle'),
			handToggle: document.getElementById('handToggle'),
			handsignalsToggle: document.getElementById('handsignalsToggle'),
			handednessFlipToggle: document.getElementById('handednessFlipToggle'),
			voicecommandsToggle: document.getElementById('voicecommandsToggle'),
			wakelockToggle: document.getElementById('wakelockToggle'), dndToggle: document.getElementById('dndToggle'), pipToggle: document.getElementById('pipToggle'), pinnedModeToggle: document.getElementById('pinnedModeToggle'), settingsLockBtn: document.getElementById('settings-lock-toggle'),
			positionSwapToggle: document.getElementById('positionSwapToggle'),
			landscapeInputResizeToggle: document.getElementById('landscapeInputResizeToggle'),
			headerswapbtn: document.getElementById('headerswapbtn'),
			headerplaybtn: document.getElementById('headerplaybtn'), headerdeletebtn: document.getElementById('headerdeletebtn'), headersettingsbtn: document.getElementById('headersettingsbtn'), headerredeembtn: document.getElementById('headerredeembtn'), headersharebtn: document.getElementById('headersharebtn'), headerthemecyclebtn: document.getElementById('headerthemecyclebtn'), headeraddmachinebtn: document.getElementById('headeraddmachinebtn'), headeruiupbtn: document.getElementById('headeruiupbtn'), headeruidownbtn: document.getElementById('headeruidownbtn'), headersequpbtn: document.getElementById('headersequpbtn'), headerseqdownbtn: document.getElementById('headerseqdownbtn'), headervolupbtn: document.getElementById('headervolupbtn'), headervoldownbtn: document.getElementById('headervoldownbtn'), headerspeedupbtn: document.getElementById('headerspeedupbtn'), headerspeeddownbtn: document.getElementById('headerspeeddownbtn'), headercycleinputbtn: document.getElementById('headercycleinputbtn'),
			headernotepadbtn: document.getElementById('headernotepadbtn'), headerhelpbtn: document.getElementById('headerhelpbtn'), headermodeswitchbtn: document.getElementById('headermodeswitchbtn'), headerresetbtn: document.getElementById('headerresetbtn'), headernukebtn: document.getElementById('headernukebtn'),
			uiScale: document.getElementById('ui-scale-select'),
			headerScale: document.getElementById('header-scale-select'),
			fontScale: document.getElementById('font-scale-select'),
			seqSize: document.getElementById('seq-size-select'),
			seqFontSize: document.getElementById('seq-font-size-select'),
			inputFontSize: document.getElementById('input-font-size-select'),
			inputBtnSize: document.getElementById('input-btn-size-select'),
			rowMax: document.getElementById('row-max-select'),
			touchResizeModeSelect: document.getElementById('gesture-mode-select'),
			closeSettingsBtn: document.getElementById('close-settings'),
			tabs: document.querySelectorAll('.tab-btn'),
			contents: document.querySelectorAll('.tab-content'),
			helpModal: document.getElementById('help-modal'), setupModal: document.getElementById('game-setup-modal'), shareModal: document.getElementById('share-modal'), closeSetupBtn: document.getElementById('close-game-setup-modal'), quickSettings: document.getElementById('quick-open-settings'), quickHelp: document.getElementById('quick-open-help'), grantPermissionsBtn: document.getElementById('grant-permissions-btn'),
			quickAutoplay: document.getElementById('quick-autoplay-toggle'), quickAudio: document.getElementById('quick-audio-toggle'), dontShowWelcome: document.getElementById('dont-introToggle'), welcomeSettingsLockToggle: document.getElementById('welcome-settings-lock-toggle'),
			quickResizeUp: document.getElementById('quick-resize-up'), quickResizeDown: document.getElementById('quick-resize-down'),
			quickCardSizeUp: document.getElementById('quick-cardsize-up'), quickCardSizeDown: document.getElementById('quick-cardsize-down'),
			openShareInside: document.getElementById('open-share-button'), closeShareBtn: document.getElementById('close-share'), closeHelpBtn: document.getElementById('close-help'), closeHelpBtnBottom: document.getElementById('close-help-btn-bottom'), openHelpBtn: document.getElementById('open-help-button'), promptDisplay: document.getElementById('prompt-display'), copyPromptBtn: document.getElementById('copy-prompt-btn'), generatePromptBtn: document.getElementById('generate-prompt-btn'),
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
			touchGestureTapSlider: document.getElementById('gesture-tap-slider'),
			touchGestureSwipeSlider: document.getElementById('gesture-swipe-slider'),
			touchGestureTapVal: document.getElementById('gesture-tap-val'),
			touchGestureSwipeVal: document.getElementById('gesture-swipe-val'),
			voiceTriggerSelect: document.getElementById('voice-trigger-select'),
			headerPaddingSelect: document.getElementById('header-padding-select'),
			inputsPaddingSelect: document.getElementById('inputs-padding-select'),
			upsidedownToggle: document.getElementById('upsidedownToggle'),
			portraitLockToggle: document.getElementById('portraitLockToggle'),
			landscapeLockToggle: document.getElementById('landscapeLockToggle'),
			headerUndoToggle: document.getElementById('headerUndoToggle'),
			fullscreenToggle: document.getElementById('fullscreenToggle'),
			ecoToggle: document.getElementById('ecoToggle'),
			arSpeedSelect: document.getElementById('ar-speed-select'),
			autoBrightToggle: document.getElementById('autoBrightToggle'),
			autoDarkToggle: document.getElementById('autoDarkToggle')
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
		if(this.dom.touchGestureToggle){
			this.dom.touchGestureToggle.checked = !!this.appSettings.isTouchGestureInputEnabled;
			this.dom.touchGestureToggle.addEventListener('change', (e) => {
					this.appSettings.isTouchGestureInputEnabled = !!e.target.checked;
					this.callbacks.onSave();
					this.updateHeaderVisibility();
					this.callbacks.onSettingsChanged && this.callbacks.onSettingsChanged();
			});
		}
		const bindToggleWithCallback = (toggleElement, settingKey, applyCallback) => {
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
		bindToggleWithCallback(this.dom.wakelockToggle, 'isWakeLockEnabled', () => {
				if (typeof window.wakelockToggle === 'function') {
					window.wakelockToggle(this.appSettings.isWakeLockEnabled);
				}
		});
		if (this.dom.settingsLockBtn) {
			this.dom.settingsLockBtn.onclick = () => {
				this.appSettings.isSettingsLockEnabled = !this.appSettings.isSettingsLockEnabled;
				this.callbacks.onSave();
				this.applySettingsLockState();
			};
			this.applySettingsLockState();
		}
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
		if (this.dom.portraitLockToggle) {
			this.dom.portraitLockToggle.onchange = (e) => {
				this.appSettings.showPortraitLockBtn = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		if (this.dom.landscapeLockToggle) {
			this.dom.landscapeLockToggle.onchange = (e) => {
				this.appSettings.showHeaderLandscapeLockBtn = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		bindToggleWithCallback(this.dom.ecoToggle, 'isEcoModeEnabled', () => {
				document.body.classList.toggle('eco-mode', this.appSettings.isEcoModeEnabled);
				if (typeof window.updateProximitySensorState === 'function') window.updateProximitySensorState();
				this.applyEcoModeConfig();
		});
		const fullProfileSaveBtn = document.getElementById('full-profile-save-btn');
		const fullProfileNameInput = document.getElementById('full-profile-name-input');
		if (fullProfileSaveBtn && fullProfileNameInput) {
			fullProfileSaveBtn.onclick = () => {
				this.saveFullProfile(fullProfileNameInput.value);
				fullProfileNameInput.value = '';
			};
		}
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
					(key) => (this.appSettings.touchGestureMappings && this.appSettings.touchGestureMappings[key]) ? this.appSettings.touchGestureMappings[key].gesture : 'none',
					(key, val) => {
						if (!this.appSettings.touchGestureMappings) this.appSettings.touchGestureMappings = {};
						if (!this.appSettings.touchGestureMappings[key]) this.appSettings.touchGestureMappings[key] = {};
						this.appSettings.touchGestureMappings[key].gesture = val;
						const el = document.querySelector(`#map-touch-${key}`);
						if (el) el.value = val;
				});
				this.bindPresetAccordion('hand', layout, filterPresetsByType(HAND_MAPPING_PRESETS, layout), LAYOUT_KEYS[layout],
					(key) => (this.appSettings.mappings && this.appSettings.mappings[key]) ? String(this.appSettings.mappings[key].handGesture) : 'none',
					(key, val) => {
						if (!this.appSettings.mappings) this.appSettings.mappings = {};
						if (!this.appSettings.mappings[key]) this.appSettings.mappings[key] = { touch: 'none', handGesture: 'none', morse: '', handSide: 'any' };
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
					if (this.appSettings.touchGestureMappings && this.appSettings.touchGestureMappings[keyId] && this.appSettings.touchGestureMappings[keyId].gesture) {
						select.value = this.appSettings.touchGestureMappings[keyId].gesture;
					}
				} else if (this.appSettings.mappings && this.appSettings.mappings[keyId] && this.appSettings.mappings[keyId].handGesture !== undefined) {
					select.value = this.appSettings.mappings[keyId].handGesture;
				}
				if (type === 'hand' && !select.dataset.sideInjected) {
					select.dataset.sideInjected = '1';
					const sideSel = document.createElement('select');
					sideSel.className = 'hand-side-select settings-input p-2 rounded text-xs font-semibold border border-gray-600 bg-gray-950 outline-none shrink-0';
					sideSel.style.width = '4.5rem';
					sideSel.innerHTML = '<option value="any">✋ Any</option><option value="L">👈 Left</option><option value="R">👉 Right</option>';
					const savedSide = (this.appSettings.mappings && this.appSettings.mappings[keyId] && this.appSettings.mappings[keyId].handSide) ? this.appSettings.mappings[keyId].handSide : 'any';
					sideSel.value = savedSide;
					sideSel.onchange = (e) => {
						if (!this.appSettings.mappings) this.appSettings.mappings = {};
						if (!this.appSettings.mappings[keyId]) this.appSettings.mappings[keyId] = { touch: 'none', handGesture: 'none', morse: '', handSide: 'any' };
						this.appSettings.mappings[keyId].handSide = e.target.value;
						this.callbacks.onSave();
					};
					select.insertAdjacentElement('afterend', sideSel);
				}
				select.onchange = (e) => {
					if (type === 'touch') {
						if (!this.appSettings.touchGestureMappings) this.appSettings.touchGestureMappings = {};
						if (!this.appSettings.touchGestureMappings[keyId]) this.appSettings.touchGestureMappings[keyId] = {};
						this.appSettings.touchGestureMappings[keyId].gesture = e.target.value;
					} else {
						if (!this.appSettings.mappings) this.appSettings.mappings = {};
						if (!this.appSettings.mappings[keyId]) this.appSettings.mappings[keyId] = { touch: 'none', handGesture: 'none', morse: '', handSide: 'any' };
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
		if (!this.appSettings.activeMappingPreset) this.appSettings.activeMappingPreset = {};
		const setActive = (val) => { this.appSettings.activeMappingPreset[select.id] = val; };
		const detectMatchingPreset = () => {
			const allPresets = { ...builtInPresets };
			Object.keys(this.appSettings[storeKey]).forEach(id => {
					if (this.appSettings[storeKey][id].layout === layout) allPresets[id] = this.appSettings[storeKey][id];
			});
			for (const id of Object.keys(allPresets)) {
				const preset = allPresets[id];
				const isMatch = keys.every(key => String(getCurrentValueFn(key)) === String(preset.map[key]));
				if (isMatch) return id;
			}
			return '';
		};
		const populate = () => {
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
			select.value = this.appSettings.activeMappingPreset[select.id] || detectMatchingPreset() || '';
		};
		populate();
		select.onchange = () => {
			const val = select.value;
			if (!val) { setActive(''); return; }
			const preset = builtInPresets[val] || this.appSettings[storeKey][val];
			if (!preset) return;
			Object.keys(preset.map).forEach(key => applyValueFn(key, preset.map[key]));
			setActive(val);
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
			setActive(id);
			this.callbacks.onSave();
			populate();
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
				setActive(val);
				this.callbacks.onSave();
				populate();
			}
		};
		if (deleteBtn) deleteBtn.onclick = () => {
			const val = select.value;
			if (!val || !this.appSettings[storeKey][val]) { alert("Cannot delete a built-in preset."); return; }
			if (confirm("Delete this preset?")) {
				delete this.appSettings[storeKey][val];
				setActive('');
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
		this.dom.playbackSpeed.value = (this.appSettings.runtimeSettings.playbackSpeed || 1.0).toFixed(2);
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
		if (this.appSettings.runtimeSettings.voicePresets) {
			Object.keys(this.appSettings.runtimeSettings.voicePresets).forEach(k => {
					const el = document.createElement('option');
					el.value = k;
					el.textContent = this.appSettings.runtimeSettings.voicePresets[k].name;
					grp2.appendChild(el);
			});
		}
		this.dom.voicePresetSelect.appendChild(grp2);
		this.dom.voicePresetSelect.value = this.appSettings.runtimeSettings.activeVoicePresetId || 'standard';
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
		if (!this.appSettings.runtimeSettings.selectedVoice && bestQualityVoice) {
			this.appSettings.runtimeSettings.selectedVoice = bestQualityVoice.name;
			this.callbacks.onSave();
		}
		this.dom.voiceNameSelect.value = this.appSettings.runtimeSettings.selectedVoice || '';
	}
	applyVoicePreset(id) {
		let preset = this.appSettings.runtimeSettings.voicePresets[id] || PREMADE_VOICE_PRESETS[id] || PREMADE_VOICE_PRESETS['standard'];
		this.appSettings.runtimeSettings.voicePitch = preset.pitch;
		this.appSettings.runtimeSettings.voiceRate = preset.rate;
		this.appSettings.runtimeSettings.voiceVolume = preset.volume;
		this.updateUIFromSettings();
		this.callbacks.onSave();
	}
	buildColorGrid() { if (!this.dom.editorGrid) return; this.dom.editorGrid.innerHTML = ''; CRAYONS.forEach(color => { const btn = document.createElement('div'); btn.style.backgroundColor = color; btn.className = "w-full h-6 rounded cursor-pointer border border-gray-700 hover:scale-125 transition-transform shadow-sm"; btn.onclick = () => this.applyColorToTarget(color); this.dom.editorGrid.appendChild(btn); }); }
	applyColorToTarget(hex) { if (!this.tempTheme) return; this.tempTheme[this.currentTargetKey] = hex; const [h, s, l] = this.hexToHsl(hex); this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l; this.dom.ftPreview.style.backgroundColor = hex; if (this.dom.ftContainer.classList.contains('hidden')) { this.dom.ftContainer.classList.remove('hidden'); this.dom.ftToggle.style.display = 'none'; } this.updatePreview(); }
	updateColorFromSliders() { const h = parseInt(this.dom.ftHue.value); const s = parseInt(this.dom.ftSat.value); const l = parseInt(this.dom.ftLit.value); const hex = this.hslToHex(h, s, l); this.dom.ftPreview.style.backgroundColor = hex; if (this.tempTheme) { this.tempTheme[this.currentTargetKey] = hex; this.updatePreview(); } }
	buildThemeFromImage(file) {
		return new Promise((resolve, reject) => {
				const img = new Image();
				const url = URL.createObjectURL(file);
				img.onload = () => {
					URL.revokeObjectURL(url);
					try {
						const size = 80;
						const canvas = document.createElement('canvas');
						canvas.width = size;
						canvas.height = size;
						const ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0, size, size);
						const data = ctx.getImageData(0, 0, size, size).data;
						const buckets = {};
						for (let i = 0; i < data.length; i += 4) {
							if (data[i + 3] < 128) continue;
							const r = Math.round(data[i] / 16) * 16;
							const g = Math.round(data[i + 1] / 16) * 16;
							const b = Math.round(data[i + 2] / 16) * 16;
							const key = r + ',' + g + ',' + b;
							buckets[key] = (buckets[key] || 0) + 1;
						}
						const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
						if (sorted.length === 0) { resolve(null); return; }
						const rgbToHex = (r, g, b) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
						const luminance = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
						const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
						const candidates = [];
						for (const [key, count] of sorted) {
							const [r, g, b] = key.split(',').map(Number);
							if (candidates.some(c => dist(c.rgb, [r, g, b]) < 40)) continue;
							const hex = rgbToHex(r, g, b);
							const [, s, l] = this.hexToHsl(hex);
							candidates.push({ rgb: [r, g, b], hex, count, luminance: luminance(r, g, b), sat: s, lit: l });
							if (candidates.length >= 12) break;
						}
						if (candidates.length === 0) { resolve(null); return; }
						const bgMain = candidates[0];
						const bubble = [...candidates].sort((a, b) => b.sat - a.sat)[0];
						let bgCard = candidates.find(c => c !== bgMain && c !== bubble && Math.abs(c.luminance - bgMain.luminance) < 60);
						if (!bgCard) {
							const [h, s, l] = this.hexToHsl(bgMain.hex);
							const adjustedL = bgMain.luminance < 128 ? Math.min(95, l + 12) : Math.max(5, l - 12);
							bgCard = { hex: this.hslToHex(h, s, adjustedL) };
						}
						let btn = candidates.find(c => c !== bgMain && c !== bubble && c !== bgCard);
						if (!btn) {
							const [h, s, l] = this.hexToHsl(bgCard.hex);
							const adjustedL = bgMain.luminance < 128 ? Math.max(5, l - 10) : Math.min(95, l + 10);
							btn = { hex: this.hslToHex(h, s, adjustedL) };
						}
						const text = bgMain.luminance < 128 ? '#f5f5f5' : '#111827';
						resolve({ bgMain: bgMain.hex, bgCard: bgCard.hex, bubble: bubble.hex, btn: btn.hex, text });
					} catch (err) {
						reject(err);
					}
				};
				img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')); };
				img.src = url;
		});
	}
	selectThemeTarget(key) {
		this.currentTargetKey = key;
		this.dom.targetBtns.forEach(b => {
				const isActive = b.dataset.target === key;
				b.classList.toggle('bg-primary-app', isActive);
				b.classList.toggle('text-white', isActive);
		});
		if (this.tempTheme) {
			const [h, s, l] = this.hexToHsl(this.tempTheme[key]);
			this.dom.ftHue.value = h; this.dom.ftSat.value = s; this.dom.ftLit.value = l;
			this.dom.ftPreview.style.backgroundColor = this.tempTheme[key];
			const nativePicker = document.getElementById('native-color-picker');
			if (nativePicker) nativePicker.value = this.tempTheme[key];
		}
	}
	openThemeEditor() { if (!this.dom.editorModal) return; const activeId = this.appSettings.activeTheme; const source = this.appSettings.customThemes[activeId] || PREMADE_THEMES[activeId] || PREMADE_THEMES['default']; this.tempTheme = { ...source }; this.dom.edName.value = this.tempTheme.name; this.selectThemeTarget('bubble'); this.updatePreview(); this.dom.editorModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.editorModal.querySelector('div').classList.remove('scale-90'); }
	updatePreview() { const t = this.tempTheme; if (!this.dom.edPreview) return; this.dom.edPreview.style.backgroundColor = t.bgMain; this.dom.edPreview.style.color = t.text; this.dom.edPreviewCard.style.backgroundColor = t.bgCard; this.dom.edPreviewCard.style.color = t.text; this.dom.edPreviewCard.style.border = '1px solid rgba(255,255,255,0.1)'; this.dom.edPreviewBtn.style.backgroundColor = t.bubble; this.dom.edPreviewBtn.style.color = t.text; const kp = document.getElementById('preview-keypad-btn'); if (kp) { kp.style.backgroundColor = t.btn; kp.style.color = t.text; } const hb = document.getElementById('preview-header-btn'); if (hb) { hb.style.backgroundColor = t.bubble; hb.style.color = '#fff'; } }
	testVoice() { if (window.speechSynthesis) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance("Testing 1 2 3."); if (this.appSettings.runtimeSettings.selectedVoice) { const v = window.speechSynthesis.getVoices().find(voice => voice.name === this.appSettings.runtimeSettings.selectedVoice); if (v) u.voice = v; } let p = parseFloat(this.dom.voicePitch.value); let r = parseFloat(this.dom.voiceRate.value); let v = parseFloat(this.dom.voiceVolume.value); u.pitch = p; u.rate = r; u.volume = v; window.speechSynthesis.speak(u); } }
	openShare() {
		this.qrScale = 100;
		if (this.updateQR) this.updateQR();
		this._settingsWasOpenBeforeShare = !!(this.dom.settingsModal && !this.dom.settingsModal.classList.contains('pointer-events-none'));
		if (this.dom.settingsModal) this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none');
		if (this.dom.shareModal) { this.dom.shareModal.classList.remove('opacity-0', 'pointer-events-none'); setTimeout(() => this.dom.shareModal.querySelector('.share-sheet').classList.add('active'), 10); }
		if (window.lockBodyScroll) window.lockBodyScroll();
	}
	closeShare() {
		if (this._settingsWasOpenBeforeShare && this.dom.settingsModal) {
			this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none');
		}
		if (this.dom.shareModal) {
			this.dom.shareModal.querySelector('.share-sheet').classList.remove('active');
			setTimeout(() => {
					this.dom.shareModal.classList.add('opacity-0', 'pointer-events-none');
					if (window.unlockBodyScroll) window.unlockBodyScroll();
				}, 300);
		} else if (window.unlockBodyScroll) {
			window.unlockBodyScroll();
		}
	}
	toggleRedeem(show) { if (show) { const isPhysicallyLandscape = window.matchMedia('(orientation: landscape)').matches; this.rScale = isPhysicallyLandscape ? 100 : 70; if (this.dom.redeemImg) this.dom.redeemImg.style.transform = getRedeemImageTransform(this.rScale); if (this.dom.redeemModal) { this.dom.redeemModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.redeemModal.classList.add('redeem-bright'); this.dom.redeemModal.style.pointerEvents = 'auto'; } if (document.body.classList.contains('eco-mode')) { document.body.classList.remove('eco-mode'); this._ecoModeSuspendedForRedeem = true; } if (window.lockBodyScroll) window.lockBodyScroll(); } else { if (this.dom.redeemModal) { this.dom.redeemModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.redeemModal.classList.remove('redeem-bright'); this.dom.redeemModal.style.pointerEvents = 'none'; } if (this._ecoModeSuspendedForRedeem && this.appSettings.isEcoModeEnabled) { document.body.classList.add('eco-mode'); } this._ecoModeSuspendedForRedeem = false; if (window.unlockBodyScroll) window.unlockBodyScroll(); } }
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
		try {
			const settingsModalEl = document.getElementById('settings-modal');
			{
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
					window.__stopAllAdvancedTests = stopAllTests;
					const handStartBtn = document.getElementById('test-hand-start-btn');
					const handPlaceholder = document.getElementById('practice-preview-placeholder');
					const previewVideo = document.getElementById('practice-preview-video');
					let handTestRunning = false;
					const stopHandTest = () => {
						if (!handTestRunning) return;
						handTestRunning = false;
						window.__handTestModeActive = false;
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
							window.__handTestModeActive = true;
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
							if (!SR) { if (readout) readout.textContent = 'Speech recognition not supported'; return; }
							testRecognition = new SR();
							testRecognition.continuous = true;
							testRecognition.interimResults = true;
							const exactWords = ['one', 'two', 'play', 'stop'];
							testRecognition.onresult = (e) => {
								const last = e.results[e.results.length - 1];
								const transcript = last[0].transcript.toLowerCase().trim();
								if (last.isFinal) {
									const words = transcript.split(/\s+/).filter(w => w !== "");
									const exactMatches = words.filter(w => exactWords.includes(w));
									if (exactMatches.length > 0) {
										exactMatches.forEach(w => window.__testChecklists?.voice?.mark(w));
										if (readout) readout.innerHTML = `<span class="text-green-400 font-bold">✓ Exact match: ${exactMatches.join(', ')}</span><br><span class="text-gray-500 text-[10px]">heard "${transcript}"</span>`;
									} else {
										if (readout) readout.innerHTML = `<span class="text-red-400 font-bold">✗ No exact match</span><br><span class="text-gray-500 text-[10px]">heard "${transcript}"</span>`;
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
					const clearToneHistoryBtn = document.getElementById('clear-tone-history-btn');
					if (clearToneHistoryBtn) {
						clearToneHistoryBtn.onclick = () => {
							const historyEl = document.getElementById('tone-test-history');
							if (historyEl) historyEl.textContent = "";
						};
					}
					const playBtn = document.getElementById('tone-test-play-btn');
					const stopBtn = document.getElementById('tone-test-stop-btn');
					const seqInput = document.getElementById('tone-test-sequence');
					const progressEl = document.getElementById('tone-test-progress');
					const noteNames = ['', ...TONE_TABLE.map(t => t.name)];
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
					const calibrationStatusEl = document.getElementById('tone-calibration-status');
					const updateCalibrationStatus = () => {
						if (!calibrationStatusEl) return;
						const cal = appSettings.toneCalibration;
						if (cal && cal.isCalibrated) {
							const n = Object.keys(cal.notes || {}).length;
							calibrationStatusEl.textContent = `Calibrated (${n}/8 notes captured)`;
						} else {
							calibrationStatusEl.textContent = 'Not yet calibrated — runs automatically on first session';
						}
					};
					updateCalibrationStatus();
					window.__updateToneCalibrationStatus = updateCalibrationStatus;
					const recalBtn = document.getElementById('tone-recalibrate-btn');
					if (recalBtn) {
						recalBtn.onclick = async () => {
							recalBtn.disabled = true;
							disableInput(true);
							await runToneCalibration();
							disableInput(false);
							recalBtn.disabled = false;
							updateCalibrationStatus();
						};
					}
					const removeCalBtn = document.getElementById('tone-remove-calibration-btn');
					if (removeCalBtn) {
						removeCalBtn.onclick = () => {
							appSettings.toneCalibration = { isCalibrated: false, notes: {} };
							saveState();
							updateCalibrationStatus();
							showToast('Tone calibration removed — standard tones restored 🗑️');
						};
					}
					const touchTestContainer = document.getElementById('test-area-lock-container');
					if (touchTestContainer && !window.__testTouchGestureEngine) {
						window.__testTouchGestureEngine = new TouchGestureEngine(touchTestContainer, {
								tapDelay: window.appSettings.touchGestureTapDelay || 300,
								swipeThreshold: window.appSettings.touchGestureSwipeDist || 30,
								longPressTime: window.appSettings.touchGestureLongPressTime || 300,
								tapPrecision: window.appSettings.touchGestureTapPrecision || 30,
								spatialThreshold: window.appSettings.touchGestureSpatialThreshold || 10,
								longSwipeThreshold: window.appSettings.touchGestureLongSwipeThreshold || 150,
								multiSwipeThreshold: window.appSettings.touchGestureMultiSwipeThreshold || 10
							}, {
								onTouchGesture: (data) => {
									const readout = document.getElementById('test-touch-readout');
									if (readout) readout.textContent = data.name || JSON.stringify(data);
									if (window.__testChecklists?.touch) window.__testChecklists.touch.mark(data.id || data.name);
								},
								onContinuous: (data) => {
									const readout = document.getElementById('test-touch-readout');
									if (readout) readout.textContent = `${data.type} (Continuous)`;
								}
						});
						window.__testTouchGestureEngine.updateAllowed([]);
						const rawEl = document.getElementById('test-touch-raw');
						const activePointers = new Map();
						const renderRaw = () => {
							if (!rawEl) return;
							if (activePointers.size === 0) { rawEl.textContent = 'No fingers down'; return; }
							const lines = Array.from(activePointers.entries()).map(([id, p]) =>
								`finger ${id}: (${Math.round(p.x)}, ${Math.round(p.y)})`);
							rawEl.textContent = `${activePointers.size} finger(s) down\n${lines.join('\n')}`;
						};
						touchTestContainer.addEventListener('pointerdown', e => {
								e.stopPropagation();
								activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
								renderRaw();
						});
						touchTestContainer.addEventListener('pointermove', e => {
								e.stopPropagation();
								if (activePointers.has(e.pointerId)) {
									activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
									renderRaw();
								}
						});
						const releasePointer = (e) => { e.stopPropagation(); activePointers.delete(e.pointerId); renderRaw(); };
						touchTestContainer.addEventListener('pointerup', releasePointer);
						touchTestContainer.addEventListener('pointercancel', releasePointer);
					}
					if (!window.__testChecklists) {
						window.__testChecklists = {};
						const buildChecklist = (containerId, items, colorClass) => {
							const container = document.getElementById(containerId);
							if (!container) return null;
							container.innerHTML = '';
							const state = {};
							items.forEach(item => {
									state[item.id] = false;
									const row = document.createElement('div');
									row.className = 'flex items-center gap-2 text-[10px]';
									row.innerHTML = `<span id="check-${containerId}-${item.id}">⬜</span><span>${item.label}</span>`;
									container.appendChild(row);
							});
							const passBanner = document.createElement('div');
							passBanner.id = `${containerId}-pass-banner`;
							passBanner.className = 'hidden mt-2 p-2 rounded bg-green-900 bg-opacity-40 border border-green-500/50 text-green-300 text-[10px] font-bold text-center';
							passBanner.textContent = '✅ All checks passed!';
							container.appendChild(passBanner);
							const checkAllPassed = () => {
								const passed = Object.values(state).every(v => v === true);
								passBanner.classList.toggle('hidden', !passed);
								return passed;
							};
							return {
								state,
								mark(id) {
									if (state[id] === true || !(id in state)) return;
									state[id] = true;
									const el = document.getElementById(`check-${containerId}-${id}`);
									if (el) el.textContent = '✅';
									checkAllPassed();
								},
								reset() {
									Object.keys(state).forEach(id => {
											state[id] = false;
											const el = document.getElementById(`check-${containerId}-${id}`);
											if (el) el.textContent = '⬜';
									});
									passBanner.classList.add('hidden');
								},
								allPassed: checkAllPassed
							};
						};
						window.__testChecklists.hand = buildChecklist('test-hand-checklist', [
								{ id: '0', label: 'Fist ✊' },
								{ id: '62', label: 'Open Palm ✋' },
								{ id: '16', label: '1 Finger ☝️' },
								{ id: '600', label: 'Thumbs Up 👍' },
						]);
						window.__testChecklists.touch = buildChecklist('test-touch-checklist', [
								{ id: 'tap', label: 'Single Tap' },
								{ id: 'double_tap', label: 'Double Tap' },
								{ id: 'swipe_up', label: 'Swipe Up' },
								{ id: 'swipe_down', label: 'Swipe Down' },
								{ id: 'swipe_left', label: 'Swipe Left' },
								{ id: 'swipe_right', label: 'Swipe Right' },
						]);
						window.__testChecklists.voice = buildChecklist('test-voice-checklist', [
								{ id: 'one', label: '"one"' },
								{ id: 'two', label: '"two"' },
								{ id: 'play', label: '"play"' },
								{ id: 'stop', label: '"stop"' },
						]);
						['hand', 'touch', 'voice'].forEach(key => {
								const btn = document.getElementById(`test-${key}-checklist-reset`);
								if (btn) btn.onclick = () => window.__testChecklists[key]?.reset();
						});
					}
				}
			}
		} catch (e) {
			console.error('Advanced wiring failed:', e);
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
			const pasteBtn = document.getElementById('hex-paste-btn');
			const hexOutput = document.getElementById('hex-output');
			if (exportBtn && hexOutput) {
				exportBtn.onclick = async () => {
					if (typeof window.settingsToBackupCode !== 'function') return;
					try {
						exportBtn.disabled = true;
						hexOutput.value = await window.settingsToBackupCode();
						if (typeof showToast === 'function') showToast('Settings exported ⬇️');
					} catch (e) {
						console.error('Export failed:', e);
						alert('Export failed - this browser may not support the compression this needs.');
					} finally {
						exportBtn.disabled = false;
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
			if (pasteBtn && hexOutput) {
				pasteBtn.onclick = async () => {
					try {
						const text = await navigator.clipboard.readText();
						if (!text.trim()) { alert('Clipboard is empty.'); return; }
						hexOutput.value = text.trim();
						if (typeof showToast === 'function') showToast('Pasted from clipboard 📋');
					} catch (e) {
						alert("Couldn't read the clipboard - your browser may need permission, or paste manually into the box instead.");
						console.warn('Clipboard read failed:', e);
					}
				};
			}
			if (importBtn && hexOutput) {
				importBtn.onclick = async () => {
					const code = hexOutput.value.trim();
					if (!code) { alert('Paste a backup code first.'); return; }
					if (!confirm('This will replace ALL current settings with the imported ones. Continue?')) return;
					try {
						importBtn.disabled = true;
						if (typeof window.importSettingsFromBackupCode === 'function') {
							await window.importSettingsFromBackupCode(code);
							if (typeof showToast === 'function') showToast('Settings imported ✅');
						}
					} catch (e) {
						alert('Import failed - that doesn\'t look like a valid backup code.');
						console.error(e);
					} finally {
						importBtn.disabled = false;
					}
				};
			}
		} catch (e) {
			console.error('Hex export/import wiring failed:', e);
		}
		try {
			const presetSelect = document.getElementById('preset-select');
			const presetOutput = document.getElementById('preset-output');
			const presetCopyBtn = document.getElementById('preset-copy-btn');
			if (presetSelect && presetOutput) {
				presetSelect.innerHTML = SETTINGS_PRESETS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
				const showSelected = () => {
					const chosen = SETTINGS_PRESETS.find(p => p.id === presetSelect.value) || SETTINGS_PRESETS[0];
					presetOutput.value = chosen ? chosen.code : '';
				};
				presetSelect.onchange = showSelected;
				showSelected();
			}
			if (presetCopyBtn && presetOutput) {
				presetCopyBtn.onclick = () => {
					if (!presetOutput.value) return;
					presetOutput.select();
					navigator.clipboard?.writeText(presetOutput.value).then(() => {
							if (typeof showToast === 'function') showToast('Copied to clipboard 📋');
					}).catch(() => document.execCommand('copy'));
				};
			}
		} catch (e) {
			console.error('Settings presets wiring failed:', e);
		}
		try {
			const resetOrderBtn = document.getElementById('header-order-reset-btn');
			if (resetOrderBtn) {
				resetOrderBtn.onclick = () => {
					if (!confirm('Reset header button order to default?')) return;
					delete this.appSettings.headerBtnOrder;
					const row = document.getElementById('header-btn-row');
					if (row) {
						DEFAULT_HEADER_BTN_ORDER.forEach(id => {
								const el = document.getElementById(id);
								if (el) row.appendChild(el);
						});
					}
					this.callbacks.onSave();
					this.renderHeaderOrderList();
					this.rebuildInfiniteHeaderScroll();
					if (typeof showToast === 'function') showToast('Header order reset ↩️');
				};
			}
		} catch (e) {
			console.error('Header order reset wiring failed:', e);
		}
		try {
			const resetGeneralOrderBtn = document.getElementById('general-order-reset-btn');
			if (resetGeneralOrderBtn) {
				resetGeneralOrderBtn.onclick = () => {
					if (!confirm('Reset General toggle order and unhide everything?')) return;
					delete this.appSettings.generalToggleOrder;
					this.appSettings.hiddenGeneralToggles = [];
					const grid = document.getElementById('general-toggle-grid');
					if (grid) {
						DEFAULT_GENERAL_TOGGLE_ORDER.forEach(id => {
								const cb = document.getElementById(id);
								if (cb && cb.parentElement) {
									cb.parentElement.classList.remove('hidden');
									grid.appendChild(cb.parentElement);
								}
						});
					}
					this.callbacks.onSave();
					this.renderGeneralOrderList();
					if (typeof showToast === 'function') showToast('General toggle order reset ↩️');
				};
			}
		} catch (e) {
			console.error('General toggle order reset wiring failed:', e);
		}
		const bindToggle = (el, prop, updateHeader = false) => {
			if (!el) return;
			el.onchange = (e) => {
				this.appSettings[prop] = e.target.checked;
				this.callbacks.onSave();
				if (updateHeader) this.updateHeaderVisibility();
			};
		};
		bindToggle(this.dom.positionSwapToggle, 'isPositionSwapEnabled', true);
		if (this.dom.landscapeInputResizeToggle) this.dom.landscapeInputResizeToggle.onchange = (e) => {
			this.appSettings.isLandscapeInputResizeEnabled = e.target.checked;
			document.body.classList.toggle('landscape-resize-enabled', e.target.checked);
			this.callbacks.onSave();
		};
		bindToggle(this.dom.pinnedModeToggle, 'showPinnedBtn', true);
		bindToggle(this.dom.dndToggle, 'showDndBtn', true);
		bindToggle(this.dom.pipToggle, 'showPipBtn', true);
		bindToggle(this.dom.randomThemeToggle, 'isRandomThemeEnabled');
		bindToggle(this.dom.autoHideHeaderToggle, 'isAutoHideHeaderEnabled', true);
		if (this.dom.autoHideHeaderToggle) {
			this.dom.autoHideHeaderToggle.addEventListener('change', () => {
				if (typeof window.updateProximitySensorState === 'function') window.updateProximitySensorState();
			});
		}
		if (this.dom.autoBrightToggle) {
			this.dom.autoBrightToggle.onchange = (e) => {
				this.appSettings.isAutoBrightEnabled = e.target.checked;
				this.callbacks.onSave();
				if (typeof window.updateAmbientSensorState === 'function') window.updateAmbientSensorState();
			};
		}
		if (this.dom.autoDarkToggle) {
			this.dom.autoDarkToggle.onchange = (e) => {
				this.appSettings.isAutoDarkEnabled = e.target.checked;
				this.callbacks.onSave();
				if (typeof window.updateAmbientSensorState === 'function') window.updateAmbientSensorState();
			};
		}
		bindToggle(this.dom.headerPlayToggle, 'showHeaderPlayBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerDeleteToggle, 'showHeaderDeleteBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerSettingsToggle, 'showHeaderSettingsBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerRedeemToggle, 'showHeaderRedeemBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerShareToggle, 'showHeaderShareBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerThemeCycleToggle, 'showHeaderThemeCycleBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerAddMachineToggle, 'showHeaderAddMachineBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerUiSizeToggle, 'showHeaderUiSizeBtns', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerSeqSizeToggle, 'showHeaderSeqSizeBtns', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerVolumeToggle, 'showHeaderVolumeBtns', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerSpeedToggle, 'showHeaderSpeedBtns', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerCycleInputToggle, 'showHeaderCycleInputBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerNotepadToggle, 'showHeaderNotepadBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerInfiniteScrollToggle, 'isHeaderInfiniteScrollEnabled', true);
		bindToggle(this.dom.inputRegulatorToggle, 'isInputRegulatorEnabled');
		bindToggle(this.dom.headerHelpToggle, 'showHeaderHelpBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerModeSwitchToggle, 'showHeaderModeSwitchBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerResetToggle, 'showHeaderResetBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerNukeToggle, 'showHeaderNukeBtn', () => this.updateHeaderVisibility());
		bindToggle(this.dom.headerUndoToggle, 'showHeaderUndoBtn', () => this.updateHeaderVisibility());
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
        bindToggle(document.getElementById('flickHeaderToggle'), 'isFlickHeaderEnabled');
        bindToggle(document.getElementById('restoreHeaderToggle'), 'isRestoreHeaderGestureEnabled');
		bindToggle(this.dom.voicecommandsToggle, 'isVoiceCommandsEnabled');
		bindToggle(this.dom.bossToggle, 'isBossModeEnabled');
		bindToggle(this.dom.handsignalsToggle, 'isHandSignalsEnabled');
		bindToggle(this.dom.handednessFlipToggle, 'handednessFlip');
		bindToggle(this.dom.volumeTouchGesturesToggle, 'isVolumeTouchGesturesEnabled');
		bindToggle(this.dom.speedTouchGesturesToggle, 'isSpeedTouchGesturesEnabled');

		if (this.dom.targetBtns) {
			this.dom.targetBtns.forEach(btn => {
					btn.onclick = () => this.selectThemeTarget(btn.dataset.target);
			});
		}
		const nativePicker = document.getElementById('native-color-picker');
		if (nativePicker) {
			nativePicker.oninput = () => this.applyColorToTarget(nativePicker.value);
		}
		const imageBtn = document.getElementById('theme-image-btn');
		const imageInput = document.getElementById('theme-image-input');
		if (imageBtn && imageInput) {
			imageBtn.onclick = () => imageInput.click();
			imageInput.onchange = () => {
				const file = imageInput.files && imageInput.files[0];
				if (!file) return;
				imageBtn.disabled = true;
				imageBtn.textContent = 'Analyzing...';
				this.buildThemeFromImage(file).then(theme => {
						if (!this.tempTheme) return;
						if (!theme) { if (typeof showToast === 'function') showToast('Could not read that image'); return; }
						this.tempTheme.bgMain = theme.bgMain;
						this.tempTheme.bgCard = theme.bgCard;
						this.tempTheme.bubble = theme.bubble;
						this.tempTheme.btn = theme.btn;
						this.tempTheme.text = theme.text;
						this.selectThemeTarget(this.currentTargetKey || 'bubble');
						this.updatePreview();
						if (typeof showToast === 'function') showToast('Theme built from photo 🖼️');
				}).catch(err => {
						console.error('Image theme extraction failed:', err);
						if (typeof showToast === 'function') showToast('Could not read that image');
				}).finally(() => {
						imageBtn.disabled = false;
						imageBtn.textContent = 'Choose a Photo';
						imageInput.value = '';
				});
			};
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
				this.appSettings.runtimeSettings.selectedVoice = e.target.value || null;
				this.callbacks.onSave();
				this.testVoice();
			};
		}
		const updateVoiceLive = () => {
			if (this.dom.voicePitch) this.appSettings.runtimeSettings.voicePitch = parseFloat(this.dom.voicePitch.value);
			if (this.dom.voiceRate) this.appSettings.runtimeSettings.voiceRate = parseFloat(this.dom.voiceRate.value);
			if (this.dom.voiceVolume) this.appSettings.runtimeSettings.voiceVolume = parseFloat(this.dom.voiceVolume.value);
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
		if (this.dom.headertonebtn) {
			this.dom.headertonebtn.addEventListener('click', () => {
					const isActive = this.dom.headertonebtn.classList.contains('ring-2');
					if (isActive) {
						this.dom.headertonebtn.classList.remove('ring-2', 'ring-emerald-500');
						document.getElementById('tone-debug-indicator')?.classList.add('hidden');
						if (typeof toneEngine !== 'undefined') toneEngine.stop();
					} else {
						const currentInput = this.appSettings.runtimeSettings && this.appSettings.runtimeSettings.currentInput;
						if (currentInput !== 'key9') {
							if (typeof showToast === 'function') showToast('Tone Cadence currently supports 9-Key input only 🎵');
							return;
						}
						this.dom.headertonebtn.classList.add('ring-2', 'ring-emerald-500');
						document.getElementById('tone-debug-indicator')?.classList.remove('hidden');
						if (typeof toneEngine !== 'undefined') toneEngine.start();
					}
			});
		}
		if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.onchange = (e) => {
			this.appSettings.runtimeSettings.activeVoicePresetId = e.target.value;
			this.applyVoicePreset(e.target.value);
		};
		if (this.dom.voicePresetAdd) {
			this.dom.voicePresetAdd.onclick = () => {
				const n = prompt("New Voice Preset Name:");
				if (n) {
					const id = 'vp_' + Date.now();
					this.appSettings.runtimeSettings.voicePresets[id] = { name: n, pitch: this.appSettings.runtimeSettings.voicePitch, rate: this.appSettings.runtimeSettings.voiceRate, volume: this.appSettings.runtimeSettings.voiceVolume };
					this.appSettings.runtimeSettings.activeVoicePresetId = id;
					this.populateVoicePresetDropdown();
					this.callbacks.onSave();
				}
			};
		}
		if (this.dom.voicePresetSave) {
			this.dom.voicePresetSave.onclick = () => {
				const id = this.appSettings.runtimeSettings.activeVoicePresetId;
				if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) {
					alert("Cannot save over built-in presets. Create a new one.");
					return;
				}
				if (this.appSettings.runtimeSettings.voicePresets[id]) {
					this.appSettings.runtimeSettings.voicePresets[id] = { ...this.appSettings.runtimeSettings.voicePresets[id], pitch: parseFloat(this.dom.voicePitch.value), rate: parseFloat(this.dom.voiceRate.value), volume: parseFloat(this.dom.voiceVolume.value) };
					this.callbacks.onSave();
					alert("Voice Preset Saved!");
				}
			};
		}
		if (this.dom.voicePresetDelete) {
			this.dom.voicePresetDelete.onclick = () => {
				const id = this.appSettings.runtimeSettings.activeVoicePresetId;
				if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) {
					alert("Cannot delete built-in.");
					return;
				}
				if (confirm("Delete this voice preset?")) {
					delete this.appSettings.runtimeSettings.voicePresets[id];
					this.appSettings.runtimeSettings.activeVoicePresetId = 'standard';
					this.populateVoicePresetDropdown();
					this.applyVoicePreset('standard');
				}
			};
		}
		if (this.dom.voicePresetRename) {
			this.dom.voicePresetRename.onclick = () => {
				const id = this.appSettings.runtimeSettings.activeVoicePresetId;
				if (typeof PREMADE_VOICE_PRESETS !== 'undefined' && PREMADE_VOICE_PRESETS[id]) return alert("Cannot rename built-in.");
				const n = prompt("Rename:", this.appSettings.runtimeSettings.voicePresets[id].name);
				if (n) {
					this.appSettings.runtimeSettings.voicePresets[id].name = n;
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
				} else {
					this.appSettings.runtimeSettings[prop] = val;
				}
				if (prop === 'isPracticeModeEnabled') this.callbacks.onUpdate();
				if (prop === 'currentInput') renderUI();
				this.callbacks.onSave();
				this.generatePrompt();
				if (['showTimer', 'showCounter', 'isVoiceInputEnabled', 'isArModeEnabled', 'showBiggerBtn', 'isHandGesturesEnabled', 'isTouchGestureInputEnabled'].includes(prop)) {
					this.updateHeaderVisibility();
				}
			};
		};
		bind(this.dom.input, 'currentInput', false);
		bind(this.dom.machines, 'machineCount', false, true);
		bind(this.dom.seqLength, 'sequenceLength', false, true);
		bind(this.dom.autoClear, 'isUniqueRoundsAutoClearEnabled', false);
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
		if (this.dom.autoplay) this.dom.autoplay.onchange = (e) => { this.appSettings.runtimeSettings.isAutoplayEnabled = e.target.checked; if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.audio) this.dom.audio.onchange = (e) => { this.appSettings.runtimeSettings.isAudioEnabled = e.target.checked; if (this.dom.quickAudio) this.dom.quickAudio.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.quickAutoplay) this.dom.quickAutoplay.onchange = (e) => { this.appSettings.runtimeSettings.isAutoplayEnabled = e.target.checked; if (this.dom.autoplay) this.dom.autoplay.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.quickAudio) this.dom.quickAudio.onchange = (e) => { this.appSettings.runtimeSettings.isAudioEnabled = e.target.checked; if (this.dom.audio) this.dom.audio.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.welcomeSettingsLockToggle) this.dom.welcomeSettingsLockToggle.onchange = (e) => { this.appSettings.isSettingsLockEnabled = e.target.checked; this.applySettingsLockState(); this.callbacks.onSave(); };
		if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = !e.target.checked; if (this.dom.showWelcome) this.dom.showWelcome.checked = e.target.checked; this.callbacks.onSave(); };
		if (this.dom.showWelcome) this.dom.showWelcome.onchange = (e) => { this.appSettings.showWelcomeScreen = !e.target.checked; if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = e.target.checked; this.callbacks.onSave(); };
		bind(this.dom.hapticMorse, 'isHapticMorseEnabled', false);
		if (this.dom.playbackSpeed) this.dom.playbackSpeed.onchange = (e) => { this.appSettings.runtimeSettings.playbackSpeed = parseFloat(e.target.value); this.callbacks.onSave(); this.generatePrompt(); };
		bind(this.dom.chunk, 'simonChunkSize', false, true);
		bind(this.dom.flash, 'isFlashEnabled', false);
		if (this.dom.pause) this.dom.pause.onchange = (e) => { this.appSettings.runtimeSettings.pauseSetting = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
		if (this.dom.delay) this.dom.delay.onchange = (e) => { this.appSettings.runtimeSettings.simonInterSequenceDelay = parseFloat(e.target.value) * 1000; this.callbacks.onSave(); this.generatePrompt(); };
		bind(this.dom.haptics, 'isHapticsEnabled', true);
		bind(this.dom.biggerToggle, 'showBiggerBtn', true);
		bind(this.dom.autoTimerToggle, 'isAutoTimerEnabled', true);
		bind(this.dom.autoCounterToggle, 'isAutoCounterEnabled', true);
		bind(this.dom.practiceMode, 'isPracticeModeEnabled', false);
		if (this.dom.uiScale) this.dom.uiScale.onchange = (e) => { this.appSettings.globalUiScale = parseInt(e.target.value); this.callbacks.onUpdate(); };
		if (this.dom.headerScale) this.dom.headerScale.onchange = (e) => {
			this.appSettings.headerIconScale = parseInt(e.target.value);
			this.applyHeaderScale();
			this.rebuildInfiniteHeaderScroll();
			this.callbacks.onSave();
		};
		if (this.dom.fontScale) this.dom.fontScale.onchange = (e) => {
			this.appSettings.appFontScale = parseInt(e.target.value);
			this.applyFontScale();
			this.callbacks.onSave();
		};
		if (this.dom.seqSize) this.dom.seqSize.onchange = (e) => { this.appSettings.uiScaleMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onUpdate(); };
		if (this.dom.seqFontSize) this.dom.seqFontSize.onchange = (e) => { this.appSettings.uiFontSizeMultiplier = parseInt(e.target.value) / 100.0; this.callbacks.onSave(); this.callbacks.onUpdate(); };
		if (this.dom.inputFontSize) this.dom.inputFontSize.onchange = (e) => {
			this.appSettings.appInputFontScale = parseInt(e.target.value);
			this.applyInputFontScale();
			this.callbacks.onSave();
		};
		if (this.dom.inputBtnSize) this.dom.inputBtnSize.onchange = (e) => {
			this.appSettings.appInputBtnScale = parseInt(e.target.value);
			this.applyInputBtnScale();
			this.callbacks.onSave();
		};
		if (this.dom.rowMax) this.dom.rowMax.onchange = (e) => {
			this.appSettings.appRowMax = e.target.value;
			this.applyRowMax();
			this.callbacks.onSave();
		};
		if (this.dom.handToggle) {
			this.dom.handToggle.checked = !!this.appSettings.isHandGesturesEnabled;
			this.dom.handToggle.onchange = (e) => {
				this.appSettings.isHandGesturesEnabled = e.target.checked;
				this.updateHeaderVisibility();
				this.callbacks.onSave();
			};
		}
		if (this.dom.arAutoCloseGeneralToggle) {
			this.dom.arAutoCloseGeneralToggle.checked = this.appSettings.isArAutoCloseEnabled ?? false;
			this.dom.arAutoCloseGeneralToggle.onchange = (e) => {
				this.appSettings.isArAutoCloseEnabled = e.target.checked;
				if (this.dom.arAutoClosePlayback) {
					this.dom.arAutoClosePlayback.checked = e.target.checked;
				}
				this.callbacks.onSave();
			};
		}
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
		if (this.dom.touchResizeModeSelect) this.dom.touchResizeModeSelect.onchange = (e) => { this.appSettings.touchResizeMode = e.target.value; this.callbacks.onSave(); };
		if (this.dom.headerPaddingSelect) this.dom.headerPaddingSelect.onchange = (e) => { this.appSettings.headerPadding = parseInt(e.target.value, 10); this.applyHeaderPadding(); this.callbacks.onSave(); };
		if (this.dom.inputsPaddingSelect) this.dom.inputsPaddingSelect.onchange = (e) => { this.appSettings.inputsPadding = parseInt(e.target.value, 10); this.applyInputsPadding(); this.callbacks.onSave(); };
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
		if (this.dom.grantPermissionsBtn) this.dom.grantPermissionsBtn.onclick = () => { if (typeof window.grantAllPermissions === 'function') window.grantAllPermissions(); };
		if (this.dom.closeHelpBtn) this.dom.closeHelpBtn.onclick = () => { if (this.dom.helpModal) this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); if (window.unlockBodyScroll) window.unlockBodyScroll(); };
		const viewportDiagBtn = document.getElementById('viewport-diag-toggle-btn');
		const viewportDiagPanel = document.getElementById('viewport-diag-panel');
		let viewportDiagResizeHandler = null;
		if (viewportDiagBtn && viewportDiagPanel) {
			viewportDiagBtn.onclick = () => {
				const isHidden = viewportDiagPanel.classList.contains('hidden');
				if (isHidden) {
					viewportDiagPanel.classList.remove('hidden');
					viewportDiagBtn.textContent = 'Hide Live Diagnostic';
					if (typeof window.renderViewportDiagnostic === 'function') {
						window.renderViewportDiagnostic();
					} else {
						// This should never happen, but if it does, make it visibly obvious
						// rather than a panel that silently stays empty and looks like the
						// button did nothing at all.
						viewportDiagPanel.textContent = 'Diagnostic function not available - try a hard refresh (Settings → Advanced → Refresh App), this build may be out of date.';
					}
					viewportDiagResizeHandler = () => { if (typeof window.renderViewportDiagnostic === 'function') window.renderViewportDiagnostic(); };
					window.addEventListener('resize', viewportDiagResizeHandler);
				} else {
					viewportDiagPanel.classList.add('hidden');
					viewportDiagBtn.textContent = 'Show Live Diagnostic';
					if (viewportDiagResizeHandler) {
						window.removeEventListener('resize', viewportDiagResizeHandler);
						viewportDiagResizeHandler = null;
					}
				}
			};
		}
		const viewportRecalibrateBtn = document.getElementById('viewport-recalibrate-btn');
		if (viewportRecalibrateBtn) {
			viewportRecalibrateBtn.onclick = () => {
				try {
					localStorage.removeItem('fm_device_extents');
				} catch (e) { /* nothing to clear if storage is unavailable */ }
				if (typeof window.vpUpdateObservedExtents === 'function') window.vpUpdateObservedExtents();
				if (typeof applyViewportProfile === 'function') applyViewportProfile();
				if (typeof window.renderViewportDiagnostic === 'function' && viewportDiagPanel && !viewportDiagPanel.classList.contains('hidden')) {
					window.renderViewportDiagnostic();
				}
				if (typeof showToast === 'function') showToast('🔄 Screen size recalibrated from the current view ✅');
			};
		}
		if (this.dom.closeHelpBtnBottom) this.dom.closeHelpBtnBottom.onclick = () => { if (this.dom.helpModal) this.dom.helpModal.classList.add('opacity-0', 'pointer-events-none'); if (window.unlockBodyScroll) window.unlockBodyScroll(); };
		if (this.dom.openHelpBtn) this.dom.openHelpBtn.onclick = () => { this.generatePrompt(); if (this.dom.helpModal) this.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none'); if (window.lockBodyScroll) window.lockBodyScroll(); };
		if (this.dom.closeSettingsBtn) this.dom.closeSettingsBtn.onclick = () => { if (window.__stopAllAdvancedTests) window.__stopAllAdvancedTests(); this.callbacks.onSave(); if (this.dom.settingsModal) { this.dom.settingsModal.classList.add('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.add('scale-90'); } if (window.unlockBodyScroll) window.unlockBodyScroll(); };
		if (this.dom.tabs) {
			this.dom.tabs.forEach(btn => {
					btn.onclick = () => {
						const parent = btn.parentElement.parentElement;
						const wasAdvancedActive = parent.querySelector('.tab-content.active')?.id === 'tab-advanced';
						const target = btn.dataset.tab;
						if (wasAdvancedActive && target !== 'advanced' && window.__stopAllAdvancedTests) window.__stopAllAdvancedTests();
						parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
						parent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
						btn.classList.add('active');
						if (target === 'help-voice') this.generatePrompt();
						const tabEl = document.getElementById(`tab-${target}`);
						if (tabEl) tabEl.classList.add('active');
					}
			});
		}
		if (this.dom.settingsModal) this.setupTabSwipe(this.dom.settingsModal);
		if (this.dom.helpModal) this.setupTabSwipe(this.dom.helpModal);
		if (this.dom.openShareInside) this.dom.openShareInside.onclick = () => this.openShare();
		if (this.dom.closeShareBtn) this.dom.closeShareBtn.onclick = () => { this.closeShare(); };
		this.rScale = 70;
		const updateRedeem = () => { if(this.dom.redeemImg) this.dom.redeemImg.style.transform = getRedeemImageTransform(this.rScale); };
		if (this.dom.closeRedeemBtn) this.dom.closeRedeemBtn.onclick = () => this.toggleRedeem(false);
		if (this.dom.openRedeemSettingsBtn) this.dom.openRedeemSettingsBtn.onclick = () => this.toggleRedeem(true);
		if (this.dom.redeemPlus) this.dom.redeemPlus.onclick = () => { this.rScale = Math.min(100, this.rScale + 10); updateRedeem(); };
		if (this.dom.redeemMinus) this.dom.redeemMinus.onclick = () => { this.rScale = Math.max(10, this.rScale - 10); updateRedeem(); };
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
			this.dom.nukeBtn.onclick = async () => {
				if (!confirm("☢️ NUKE APP? This will wipe all saved data, clear browser caches, unregister Service Workers, and force a fresh update from the server. This works even if the app is broken.")) return;
				this.dom.nukeBtn.disabled = true;
				this.dom.nukeBtn.textContent = '⏳';
				await performNuke();
				window.location.href = window.location.pathname;
			};
		}
		const refreshBtn = document.querySelector('button[data-action="force-refresh"]');
		if (refreshBtn) {
			refreshBtn.onclick = async () => {
				if (!confirm("🔄 REFRESH APP? This will clear the browser cache and service worker, forcing a fresh download. Your settings will be kept.")) return;
				refreshBtn.disabled = true;
				refreshBtn.textContent = '⏳';
				await performForceRefresh();
				window.location.reload();
			};
		}
		if (this.dom.quickResizeUp) this.dom.quickResizeUp.onclick = () => { this.appSettings.globalUiScale = Math.min(200, this.appSettings.globalUiScale + 10); this.callbacks.onSave(); this.callbacks.onUpdate(); this.updateWelcomeSample(); };
		if (this.dom.quickResizeDown) this.dom.quickResizeDown.onclick = () => { this.appSettings.globalUiScale = Math.max(50, this.appSettings.globalUiScale - 10); this.callbacks.onSave(); this.callbacks.onUpdate(); this.updateWelcomeSample(); };
		if (this.dom.quickCardSizeUp) this.dom.quickCardSizeUp.onclick = () => {
			this.appSettings.uiScaleMultiplier = Math.min(3.0, (this.appSettings.uiScaleMultiplier || 1.0) + 0.1);
			const sel = document.getElementById('seq-size-select');
			if (sel) sel.value = Math.round(this.appSettings.uiScaleMultiplier * 100);
			this.callbacks.onSave();
			this.callbacks.onUpdate();
			this.updateWelcomeSample();
		};
		if (this.dom.quickCardSizeDown) this.dom.quickCardSizeDown.onclick = () => {
			this.appSettings.uiScaleMultiplier = Math.max(0.5, (this.appSettings.uiScaleMultiplier || 1.0) - 0.1);
			const sel = document.getElementById('seq-size-select');
			if (sel) sel.value = Math.round(this.appSettings.uiScaleMultiplier * 100);
			this.callbacks.onSave();
			this.callbacks.onUpdate();
			this.updateWelcomeSample();
		};
		if (this.dom.touchGestureTapSlider) {
			this.dom.touchGestureTapSlider.oninput = (e) => {
				const val = parseInt(e.target.value);
				this.appSettings.touchGestureTapDelay = val;
				if (this.dom.touchGestureTapVal) this.dom.touchGestureTapVal.textContent = val + 'ms';
				this.callbacks.onSave();
			};
		}
		if (this.dom.touchGestureSwipeSlider) {
			this.dom.touchGestureSwipeSlider.oninput = (e) => {
				const val = parseInt(e.target.value);
				this.appSettings.touchGestureSwipeDist = val;
				if (this.dom.touchGestureSwipeVal) this.dom.touchGestureSwipeVal.textContent = val + 'px';
				this.callbacks.onSave();
			};
		}
	}
	populateConfigDropdown() { const createOptions = () => Object.keys(this.appSettings.profiles).map(id => { const o = document.createElement('option'); o.value = id; o.textContent = this.appSettings.profiles[id].name; return o; }); if (this.dom.configSelect) { this.dom.configSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.configSelect.appendChild(opt)); this.dom.configSelect.value = this.appSettings.activeProfileId; } if (this.dom.quickConfigSelect) { this.dom.quickConfigSelect.innerHTML = ''; createOptions().forEach(opt => this.dom.quickConfigSelect.appendChild(opt)); this.dom.quickConfigSelect.value = this.appSettings.activeProfileId; } }
	populateThemeDropdown() { const s = this.dom.themeSelect; if (!s) return; s.innerHTML = ''; const grp1 = document.createElement('optgroup'); grp1.label = "Built-in"; Object.keys(PREMADE_THEMES).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = PREMADE_THEMES[k].name; grp1.appendChild(el); }); s.appendChild(grp1); const grp2 = document.createElement('optgroup'); grp2.label = "My Themes"; Object.keys(this.appSettings.customThemes).forEach(k => { const el = document.createElement('option'); el.value = k; el.textContent = this.appSettings.customThemes[k].name; grp2.appendChild(el); }); s.appendChild(grp2); s.value = this.appSettings.activeTheme; }
	openSettings() { this.populateConfigDropdown(); this.populateThemeDropdown(); this.updateUIFromSettings(); this.initEcoModeConfigUI(); this.renderFullProfileList(); if (typeof initViewportProfilesUI === 'function') initViewportProfilesUI(); this.dom.settingsModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.settingsModal.querySelector('div').classList.remove('scale-90'); if (window.lockBodyScroll) window.lockBodyScroll(); }
	openSetup() { this.populateConfigDropdown(); this.updateUIFromSettings(); this.dom.setupModal.classList.remove('opacity-0', 'pointer-events-none'); this.dom.setupModal.querySelector('div').classList.remove('scale-90'); if (window.lockBodyScroll) window.lockBodyScroll(); this.updateWelcomeSample(); }
	applySettingsLockState() {
		if (!this.dom.settingsLockBtn) return;
		const locked = !!this.appSettings.isSettingsLockEnabled;
		this.dom.settingsLockBtn.textContent = locked ? '🔒' : '🔓';
		this.dom.settingsLockBtn.title = locked ? 'Settings Locked - tap to unlock' : 'Lock Settings';
		if (this.dom.welcomeSettingsLockToggle) this.dom.welcomeSettingsLockToggle.checked = locked;
		if (this.dom.settingsModal) {
			const card = this.dom.settingsModal.querySelector('.settings-modal-bg');
			if (card) card.classList.toggle('settings-locked', locked);
		}
	}
	updateWelcomeSample() {
		const holder = document.getElementById('welcome-sample-sequence');
		if (!holder) return;
		holder.innerHTML = '';
		const scale = this.appSettings.uiScaleMultiplier || 1.0;
		const boxSize = 40 * scale;
		const fontMult = this.appSettings.uiFontSizeMultiplier || 1.0;
		const fontSizePx = boxSize * 0.5 * fontMult;
		[1, 2, 3, 4, 5].forEach(num => {
				const span = document.createElement('span');
				span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold";
				span.style.width = boxSize + 'px';
				span.style.height = boxSize + 'px';
				span.style.fontSize = fontSizePx + 'px';
				span.textContent = num;
				holder.appendChild(span);
		});
	}
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
		this.applySavedGeneralToggleOrder();
		this.renderGeneralOrderList();
		const ps = this.appSettings.runtimeSettings;
		if (this.dom.input) this.dom.input.value = ps.currentInput;
		if (this.dom.mode) this.dom.mode.value = ps.currentMode;
		if (this.dom.machines) this.dom.machines.value = ps.machineCount;
		if (this.dom.seqLength) this.dom.seqLength.value = ps.sequenceLength;
		if (this.dom.autoClear) this.dom.autoClear.checked = this.appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled;
		if (this.dom.autoplay) this.dom.autoplay.checked = this.appSettings.runtimeSettings.isAutoplayEnabled;
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
		if (this.dom.audio) this.dom.audio.checked = this.appSettings.runtimeSettings.isAudioEnabled;
		if (this.dom.quickAutoplay) this.dom.quickAutoplay.checked = this.appSettings.runtimeSettings.isAutoplayEnabled;
		if (this.dom.quickAudio) this.dom.quickAudio.checked = this.appSettings.runtimeSettings.isAudioEnabled;
		if (this.dom.dontShowWelcome) this.dom.dontShowWelcome.checked = !this.appSettings.showWelcomeScreen;
		if (this.dom.showWelcome) this.dom.showWelcome.checked = !this.appSettings.showWelcomeScreen;
		if (this.dom.hapticMorse) this.dom.hapticMorse.checked = this.appSettings.runtimeSettings.isHapticMorseEnabled;
		if (this.dom.flash) this.dom.flash.checked = this.appSettings.runtimeSettings.isFlashEnabled;
		if (this.dom.pause) this.dom.pause.value = (this.appSettings.runtimeSettings.pauseSetting || 0) / 1000;
		if (this.dom.playbackSpeed) this.dom.playbackSpeed.value = (this.appSettings.runtimeSettings.playbackSpeed || 1.0).toFixed(2);
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
		if (this.dom.voicePitch) this.dom.voicePitch.value = this.appSettings.runtimeSettings.voicePitch || 1.0;
		this.populateVoiceNameDropdown();
		if (this.dom.voiceRate) this.dom.voiceRate.value = this.appSettings.runtimeSettings.voiceRate || 1.0;
		if (this.dom.voiceVolume) this.dom.voiceVolume.value = this.appSettings.runtimeSettings.voiceVolume || 1.0;
		if (this.dom.voicePresetSelect) this.dom.voicePresetSelect.value = this.appSettings.runtimeSettings.activeVoicePresetId || 'standard';
		if (this.dom.practiceMode) this.dom.practiceMode.checked = this.appSettings.runtimeSettings.isPracticeModeEnabled;
		if (this.dom.biggerToggle) this.dom.biggerToggle.checked = this.appSettings.showBiggerBtn;
		if (this.dom.arcamToggle) this.dom.arcamToggle.checked = !!this.appSettings.isArModeEnabled;
		if (this.dom.voiceToggle) this.dom.voiceToggle.checked = !!this.appSettings.isVoiceInputEnabled;
		if (this.dom.timerToggle) this.dom.timerToggle.checked = !!this.appSettings.showTimer;
		if (this.dom.counterToggle) this.dom.counterToggle.checked = !!this.appSettings.showCounter;
		if (this.dom.haptics) this.dom.haptics.checked = (typeof this.appSettings.isHapticsEnabled === 'undefined') ? true : this.appSettings.isHapticsEnabled;
		if (this.dom.speedTouchGesturesToggle) this.dom.speedTouchGesturesToggle.checked = !!this.appSettings.isSpeedTouchGesturesEnabled;
		if (this.dom.volumeTouchGesturesToggle) this.dom.volumeTouchGesturesToggle.checked = !!this.appSettings.isVolumeTouchGesturesEnabled;
		if (this.dom.autoTimerToggle) this.dom.autoTimerToggle.checked = !!this.appSettings.isAutoTimerEnabled;
		if (this.dom.autoCounterToggle) this.dom.autoCounterToggle.checked = !!this.appSettings.isAutoCounterEnabled;
		if (this.dom.uiScale) this.dom.uiScale.value = this.appSettings.globalUiScale || 100;
		if (this.dom.headerScale) this.dom.headerScale.value = this.appSettings.headerIconScale || 100;
		if (this.dom.fontScale) this.dom.fontScale.value = this.appSettings.appFontScale || 100;
		if (this.dom.seqSize) this.dom.seqSize.value = Math.round(this.appSettings.uiScaleMultiplier * 100) || 100;
		if (this.dom.seqFontSize) this.dom.seqFontSize.value = Math.round((this.appSettings.uiFontSizeMultiplier || 1.0) * 100);
		if (this.dom.inputFontSize) this.dom.inputFontSize.value = this.appSettings.appInputFontScale || 100;
		if (this.dom.rowMax) this.dom.rowMax.value = this.appSettings.appRowMax || 'none';
		if (this.dom.inputBtnSize) this.dom.inputBtnSize.value = this.appSettings.appInputBtnScale || 100;
		if (this.dom.touchGestureTapSlider) {
			const tapVal = this.appSettings.touchGestureTapDelay || 300;
			this.dom.touchGestureTapSlider.value = tapVal;
			this.dom.touchGestureTapVal.textContent = tapVal + 'ms';
		}
		if (this.dom.touchGestureSwipeSlider) {
			const swipeVal = this.appSettings.touchGestureSwipeDist || 30;
			this.dom.touchGestureSwipeSlider.value = swipeVal;
			this.dom.touchGestureSwipeVal.textContent = swipeVal + 'px';
		}
                if (document.getElementById('flickHeaderToggle')) {
            document.getElementById('flickHeaderToggle').checked = !!this.appSettings.isFlickHeaderEnabled;
        }
        if (document.getElementById('restoreHeaderToggle')) {
            document.getElementById('restoreHeaderToggle').checked = !!this.appSettings.isRestoreHeaderGestureEnabled;
        }

		if (this.dom.touchResizeModeSelect) this.dom.touchResizeModeSelect.value = this.appSettings.touchResizeMode || 'none';
		if (this.dom.headerPaddingSelect) this.dom.headerPaddingSelect.value = this.appSettings.headerPadding || 0;
		if (this.dom.inputsPaddingSelect) this.dom.inputsPaddingSelect.value = this.appSettings.inputsPadding || 0;
		this.applyHeaderPadding();
		this.applyInputsPadding();
		if (this.dom.bossToggle) this.dom.bossToggle.checked = this.appSettings.isBossModeEnabled;
		if (this.dom.arAutoCloseGeneralToggle) this.dom.arAutoCloseGeneralToggle.checked = this.appSettings.isArAutoCloseEnabled ?? false;
		if (this.dom.arAutoClosePlayback) this.dom.arAutoClosePlayback.checked = this.appSettings.isArAutoCloseEnabled ?? false;
		if (this.dom.touchGestureToggle) this.dom.touchGestureToggle.checked = !!this.appSettings.isTouchGestureInputEnabled;
		if (this.dom.handToggle) this.dom.handToggle.checked = !!this.appSettings.isHandGesturesEnabled;
		if (this.dom.handsignalsToggle) this.dom.handsignalsToggle.checked = !!this.appSettings.isHandSignalsEnabled;
		if (this.dom.handednessFlipToggle) this.dom.handednessFlipToggle.checked = !!this.appSettings.handednessFlip;
		if (this.dom.voicecommandsToggle) this.dom.voicecommandsToggle.checked = !!this.appSettings.isVoiceCommandsEnabled;
		if (this.dom.wakelockToggle) this.dom.wakelockToggle.checked = (typeof this.appSettings.isWakeLockEnabled === 'undefined') ? true : this.appSettings.isWakeLockEnabled;
		if (this.dom.randomThemeToggle) this.dom.randomThemeToggle.checked = !!this.appSettings.isRandomThemeEnabled;
		if (this.dom.autoHideHeaderToggle) this.dom.autoHideHeaderToggle.checked = !!this.appSettings.isAutoHideHeaderEnabled;
		if (this.dom.autoBrightToggle) this.dom.autoBrightToggle.checked = !!this.appSettings.isAutoBrightEnabled;
		if (this.dom.autoDarkToggle) this.dom.autoDarkToggle.checked = !!this.appSettings.isAutoDarkEnabled;
		if (this.dom.dndToggle) this.dom.dndToggle.checked = !!this.appSettings.showDndBtn;
		if (this.dom.pipToggle) this.dom.pipToggle.checked = !!this.appSettings.showPipBtn;
		if (this.dom.pinnedModeToggle) this.dom.pinnedModeToggle.checked = !!this.appSettings.showPinnedBtn;
		if (this.dom.skeletonDebugToggle) this.dom.skeletonDebugToggle.checked = !!this.appSettings.isSkeletonDebugEnabled;
		if (this.dom.fontSelect) this.dom.fontSelect.value = this.appSettings.activeFontFamily || "'Inter', sans-serif";
		if (this.dom.positionSwapToggle) this.dom.positionSwapToggle.checked = !!this.appSettings.isPositionSwapEnabled;
		if (this.dom.landscapeInputResizeToggle) this.dom.landscapeInputResizeToggle.checked = !!this.appSettings.isLandscapeInputResizeEnabled;
		if (this.dom.fullscreenToggle) {
			this.dom.fullscreenToggle.checked = !!this.appSettings.showFullscreenBtn;
		}
		if (this.dom.upsidedownToggle) {
			this.dom.upsidedownToggle.checked = !!this.appSettings.showUpsideDownBtn;
		}
		if (this.dom.portraitLockToggle) {
			this.dom.portraitLockToggle.checked = !!this.appSettings.showPortraitLockBtn;
		}
		if (this.dom.landscapeLockToggle) {
			this.dom.landscapeLockToggle.checked = !!this.appSettings.showHeaderLandscapeLockBtn;
		}
		if (this.dom.headerPlayToggle) this.dom.headerPlayToggle.checked = !!this.appSettings.showHeaderPlayBtn;
		if (this.dom.headerDeleteToggle) this.dom.headerDeleteToggle.checked = !!this.appSettings.showHeaderDeleteBtn;
		if (this.dom.headerUndoToggle) this.dom.headerUndoToggle.checked = !!this.appSettings.showHeaderUndoBtn;
		if (this.dom.headerSettingsToggle) this.dom.headerSettingsToggle.checked = !!this.appSettings.showHeaderSettingsBtn;
		if (this.dom.headerRedeemToggle) this.dom.headerRedeemToggle.checked = !!this.appSettings.showHeaderRedeemBtn;
		if (this.dom.headerShareToggle) this.dom.headerShareToggle.checked = !!this.appSettings.showHeaderShareBtn;
		if (this.dom.headerThemeCycleToggle) this.dom.headerThemeCycleToggle.checked = !!this.appSettings.showHeaderThemeCycleBtn;
		if (this.dom.headerAddMachineToggle) this.dom.headerAddMachineToggle.checked = !!this.appSettings.showHeaderAddMachineBtn;
		if (this.dom.headerUiSizeToggle) this.dom.headerUiSizeToggle.checked = !!this.appSettings.showHeaderUiSizeBtns;
		if (this.dom.headerSeqSizeToggle) this.dom.headerSeqSizeToggle.checked = !!this.appSettings.showHeaderSeqSizeBtns;
		if (this.dom.headerVolumeToggle) this.dom.headerVolumeToggle.checked = !!this.appSettings.showHeaderVolumeBtns;
		if (this.dom.headerSpeedToggle) this.dom.headerSpeedToggle.checked = !!this.appSettings.showHeaderSpeedBtns;
		if (this.dom.headerCycleInputToggle) this.dom.headerCycleInputToggle.checked = !!this.appSettings.showHeaderCycleInputBtn;
		if (this.dom.headerNotepadToggle) this.dom.headerNotepadToggle.checked = !!this.appSettings.showHeaderNotepadBtn;
		if (this.dom.headerInfiniteScrollToggle) this.dom.headerInfiniteScrollToggle.checked = this.appSettings.isHeaderInfiniteScrollEnabled !== false;
		if (this.dom.inputRegulatorToggle) this.dom.inputRegulatorToggle.checked = this.appSettings.isInputRegulatorEnabled !== false;
		if (this.dom.headerHelpToggle) this.dom.headerHelpToggle.checked = !!this.appSettings.showHeaderHelpBtn;
		if (this.dom.headerModeSwitchToggle) this.dom.headerModeSwitchToggle.checked = !!this.appSettings.showHeaderModeSwitchBtn;
		if (this.dom.headerResetToggle) this.dom.headerResetToggle.checked = !!this.appSettings.showHeaderResetBtn;
		if (this.dom.headerNukeToggle) this.dom.headerNukeToggle.checked = !!this.appSettings.showHeaderNukeBtn;
		this.applySettingsLockState();
		if (this.dom.arSpeedSelect) {
			const speedVal = this.appSettings.arPlaybackSpeed || 1.0;
			this.dom.arSpeedSelect.value = String(speedVal);
		}
		this.updateHeaderVisibility();
	}
	updateHeaderVisibility() {
		this.applySavedHeaderOrder();
		const header = document.getElementById('aux-control-header');
		const timerBtn = document.getElementById('headertimerbtn');
		const counterBtn = document.getElementById('headercounterbtn');
		const micBtn = document.getElementById('headervoicebtn');
		const camBtn = document.getElementById('headerarcambtn');
		const touchGestureBtn = document.getElementById('headertouchbtn');
		const biggerBtn = document.getElementById('headerbiggerbtn');
		const handBtn = document.getElementById('headerhandbtn');
		if (!header) return;
		const showTimer = !!this.appSettings.showTimer;
		const showCounter = !!this.appSettings.showCounter;
		const showMic = !!this.appSettings.isVoiceInputEnabled;
		const showCam = !!this.appSettings.isArModeEnabled;
		const showTouchGesture = !!this.appSettings.isTouchGestureInputEnabled;
		const showBigger = !!this.appSettings.showBiggerBtn;
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
		if (this.dom.headerportraitlockbtn) {
			this.dom.headerportraitlockbtn.classList.toggle('hidden', !this.appSettings.showPortraitLockBtn);
			if (typeof updatePortraitLockBtnState === 'function') updatePortraitLockBtnState();
		}
		if (this.dom.headerlandscapelockbtn) {
			this.dom.headerlandscapelockbtn.classList.toggle('hidden', !this.appSettings.showHeaderLandscapeLockBtn);
			if (typeof updateLandscapeLockBtnState === 'function') updateLandscapeLockBtnState();
		}
		if (this.dom.headerpinnedbtn) this.dom.headerpinnedbtn.classList.toggle('hidden', !this.appSettings.showPinnedBtn);
		if (this.dom.headerdndbtn) this.dom.headerdndbtn.classList.toggle('hidden', !this.appSettings.showDndBtn);
		if (this.dom.headerpipbtn) this.dom.headerpipbtn.classList.toggle('hidden', !this.appSettings.showPipBtn);
		const showSwap = !!this.appSettings.isPositionSwapEnabled;
		if(timerBtn) timerBtn.classList.toggle('hidden', !showTimer);
		if(counterBtn) counterBtn.classList.toggle('hidden', !showCounter);
		if(micBtn) micBtn.classList.toggle('hidden', !showMic);
		if(camBtn) camBtn.classList.toggle('hidden', !showCam);
		if(touchGestureBtn) touchGestureBtn.classList.toggle('hidden', !showTouchGesture);
		if(biggerBtn) biggerBtn.classList.toggle('hidden', !showBigger);
		if(handBtn) handBtn.classList.toggle('hidden', !showHand);
		if(this.dom.headerswapbtn) this.dom.headerswapbtn.classList.toggle('hidden', !showSwap);
		if (this.dom.headerplaybtn) this.dom.headerplaybtn.classList.toggle('hidden', !this.appSettings.showHeaderPlayBtn);
		if (this.dom.headerdeletebtn) this.dom.headerdeletebtn.classList.toggle('hidden', !this.appSettings.showHeaderDeleteBtn);
		if (this.dom.headerundobtn) this.dom.headerundobtn.classList.toggle('hidden', !this.appSettings.showHeaderUndoBtn);
		if (this.dom.headersettingsbtn) this.dom.headersettingsbtn.classList.toggle('hidden', !this.appSettings.showHeaderSettingsBtn);
		if (this.dom.headerredeembtn) this.dom.headerredeembtn.classList.toggle('hidden', !this.appSettings.showHeaderRedeemBtn);
		if (this.dom.headersharebtn) this.dom.headersharebtn.classList.toggle('hidden', !this.appSettings.showHeaderShareBtn);
		if (this.dom.headerthemecyclebtn) this.dom.headerthemecyclebtn.classList.toggle('hidden', !this.appSettings.showHeaderThemeCycleBtn);
		if (this.dom.headeraddmachinebtn) this.dom.headeraddmachinebtn.classList.toggle('hidden', !this.appSettings.showHeaderAddMachineBtn);
		if (this.dom.headeruiupbtn) this.dom.headeruiupbtn.classList.toggle('hidden', !this.appSettings.showHeaderUiSizeBtns);
		if (this.dom.headeruidownbtn) this.dom.headeruidownbtn.classList.toggle('hidden', !this.appSettings.showHeaderUiSizeBtns);
		if (this.dom.headersequpbtn) this.dom.headersequpbtn.classList.toggle('hidden', !this.appSettings.showHeaderSeqSizeBtns);
		if (this.dom.headerseqdownbtn) this.dom.headerseqdownbtn.classList.toggle('hidden', !this.appSettings.showHeaderSeqSizeBtns);
		if (this.dom.headervolupbtn) this.dom.headervolupbtn.classList.toggle('hidden', !this.appSettings.showHeaderVolumeBtns);
		if (this.dom.headervoldownbtn) this.dom.headervoldownbtn.classList.toggle('hidden', !this.appSettings.showHeaderVolumeBtns);
		if (this.dom.headerspeedupbtn) this.dom.headerspeedupbtn.classList.toggle('hidden', !this.appSettings.showHeaderSpeedBtns);
		if (this.dom.headerspeeddownbtn) this.dom.headerspeeddownbtn.classList.toggle('hidden', !this.appSettings.showHeaderSpeedBtns);
		if (this.dom.headercycleinputbtn) this.dom.headercycleinputbtn.classList.toggle('hidden', !this.appSettings.showHeaderCycleInputBtn);
		if (this.dom.headernotepadbtn) this.dom.headernotepadbtn.classList.toggle('hidden', !this.appSettings.showHeaderNotepadBtn);
		if (this.dom.headerhelpbtn) this.dom.headerhelpbtn.classList.toggle('hidden', !this.appSettings.showHeaderHelpBtn);
		if (this.dom.headermodeswitchbtn) this.dom.headermodeswitchbtn.classList.toggle('hidden', !this.appSettings.showHeaderModeSwitchBtn);
		if (this.dom.headerresetbtn) this.dom.headerresetbtn.classList.toggle('hidden', !this.appSettings.showHeaderResetBtn);
		if (this.dom.headernukebtn) this.dom.headernukebtn.classList.toggle('hidden', !this.appSettings.showHeaderNukeBtn);
		if (this.dom.headertonebtn) {
			this.dom.headertonebtn.classList.toggle('hidden', !this.appSettings.isToneCadenceEnabled);
		}
		const anyNewBtnShown = this.appSettings.showHeaderPlayBtn || this.appSettings.showHeaderDeleteBtn || this.appSettings.showHeaderUndoBtn || this.appSettings.showHeaderSettingsBtn || this.appSettings.showHeaderRedeemBtn || this.appSettings.showHeaderShareBtn || this.appSettings.showHeaderThemeCycleBtn || this.appSettings.showHeaderAddMachineBtn || this.appSettings.showHeaderUiSizeBtns || this.appSettings.showHeaderSeqSizeBtns || this.appSettings.showHeaderVolumeBtns || this.appSettings.showHeaderSpeedBtns || this.appSettings.showHeaderCycleInputBtn || this.appSettings.showHeaderNotepadBtn || this.appSettings.showHeaderHelpBtn || this.appSettings.showHeaderModeSwitchBtn || this.appSettings.showHeaderResetBtn || this.appSettings.showHeaderNukeBtn || this.appSettings.showFullscreenBtn || this.appSettings.showUpsideDownBtn || this.appSettings.showPortraitLockBtn || this.appSettings.showHeaderLandscapeLockBtn || this.appSettings.showPinnedBtn || this.appSettings.showDndBtn || this.appSettings.showPipBtn;
		if (!showTimer && !showCounter && !showMic && !showCam && !showTouchGesture && !showBigger && !showHand && !showSwap && !this.appSettings.isToneCadenceEnabled && !anyNewBtnShown) {
			header.classList.add('header-hidden');
		} else {
			header.classList.remove('header-hidden');
		}
		this.applyHeaderScale();
		this.applyFontScale();
		this.applyInputFontScale();
		this.applyInputBtnScale();
		this.applyRowMax();
		this.rebuildInfiniteHeaderScroll();
		this.renderHeaderOrderList();
		const autoHideOn = !!this.appSettings.isAutoHideHeaderEnabled;
		const wasAlreadyOn = header.classList.contains('auto-hide-header-enabled');
		header.classList.toggle('auto-hide-header-enabled', autoHideOn);
		if (autoHideOn && !wasAlreadyOn) {
			header.classList.add('auto-hide-inactive');
		} else if (!autoHideOn) {
			header.classList.remove('auto-hide-inactive');
			if (window.__clearAutoHideHeaderTimer) window.__clearAutoHideHeaderTimer();
		}
	}
	_headerBtnOrder() {
		const row = document.getElementById('header-btn-row');
		if (!row) return [];
		return [...row.children].filter(el => el.id && !el.dataset.cloneId).map(el => el.id);
	}
	_headerBtnLabels() {
		return { headertimerbtn: '⏱️ Timer', headercounterbtn: '# Counter', headervoicebtn: '🎤 Mic', headertonebtn: '🎵 Tone Cadence', headertouchbtn: '🗒️ Gesture Pad', headerhandbtn: '🖐️ Hand Tracking', headerarcambtn: '📷 AR Mode', headerbiggerbtn: '⌨️ Bigger Buttons', headerfullscreenbtn: '🔲 Full Screen', headerpinnedbtn: '📌 Pinned Mode', headerdndbtn: '🔕 Do Not Disturb', headerpipbtn: '🪟 Picture in Picture', headerupsidedownbtn: '🙃 Upside Down', headerportraitlockbtn: '🔒 Portrait Lock', headerlandscapelockbtn: '🔐 Landscape Lock', headerswapbtn: '🔄 Position Swap', headerplaybtn: '▶️ Play', headerdeletebtn: '⌫ Delete', headerundobtn: '↩️ Undo', headersettingsbtn: '⚙️ Settings', headerhelpbtn: '📚 Help', headermodeswitchbtn: '🎮 Mode Switch', headerredeembtn: '🆔 Redeem', headersharebtn: '📤 Share', headerthemecyclebtn: '🎨 Theme Cycle', headeraddmachinebtn: '➕ Add Machine', headeruiupbtn: '🔍+ UI Size Up', headeruidownbtn: '🔍- UI Size Down', headersequpbtn: '🔢+ Sequence Size Up', headerseqdownbtn: '🔢- Sequence Size Down', headervolupbtn: '🔊+ Volume Up', headervoldownbtn: '🔊- Volume Down', headerspeedupbtn: '🐇+ Speed Up', headerspeeddownbtn: '🐇- Speed Down', headercycleinputbtn: '🔀 Cycle Input', headerresetbtn: '♻️ Reset', headernukebtn: '☢️ Nuke', headernotepadbtn: '📝 Notepad' };
	}
	_moveHeaderBtn(id, direction) {
		const row = document.getElementById('header-btn-row');
		if (!row) return;
		const order = this._headerBtnOrder();
		const i = order.indexOf(id);
		const j = direction === 'up' ? i - 1 : i + 1;
		if (i === -1 || j < 0 || j >= order.length) return;
		[order[i], order[j]] = [order[j], order[i]];
		order.forEach(btnId => {
				const el = document.getElementById(btnId);
				if (el) row.appendChild(el);
		});
		this.appSettings.headerBtnOrder = order;
		this.callbacks.onSave();
		this.renderHeaderOrderList();
		this.rebuildInfiniteHeaderScroll();
	}
	applySavedHeaderOrder() {
		const row = document.getElementById('header-btn-row');
		const saved = this.appSettings.headerBtnOrder;
		if (!row || !Array.isArray(saved) || saved.length === 0) return;
		const current = this._headerBtnOrder();
		const sameSet = saved.length === current.length && saved.every(id => current.includes(id));
		if (!sameSet) return;
		saved.forEach(id => {
				const el = document.getElementById(id);
				if (el) row.appendChild(el);
		});
	}
	_setupDragReorder(container, onReorder) {
		if (container.dataset.dragWired === '1') return;
		container.dataset.dragWired = '1';
		let dragRow = null;
		let startClientY = 0;
		const onMove = (e) => {
			if (!dragRow) return;
			e.preventDefault();
			const dy = e.clientY - startClientY;
			dragRow.style.transform = `translateY(${dy}px)`;
			const dragRect = dragRow.getBoundingClientRect();
			const dragMid = dragRect.top + dragRect.height / 2;
			// Only ever compare against the immediate previous/next sibling in the direction the
			// pointer is actually moving, and swap one step at a time. The old version scanned
			// every row in the list top-to-bottom on every tick and swapped with the first one
			// whose midpoint satisfied a loose inequality - that matched rows on the wrong side of
			// the drag (e.g. rows below when dragging up), which is why dragging up moved the row
			// down instead, and why a single continued drag could cascade through many rows at
			// once instead of moving one slot per crossing.
			if (dy < 0) {
				const prev = dragRow.previousElementSibling;
				if (prev) {
					const prevRect = prev.getBoundingClientRect();
					const prevMid = prevRect.top + prevRect.height / 2;
					if (dragMid < prevMid) {
						container.insertBefore(dragRow, prev);
						dragRow.style.transform = '';
						startClientY = e.clientY;
					}
				}
			} else if (dy > 0) {
				const next = dragRow.nextElementSibling;
				if (next) {
					const nextRect = next.getBoundingClientRect();
					const nextMid = nextRect.top + nextRect.height / 2;
					if (dragMid > nextMid) {
						container.insertBefore(dragRow, next.nextElementSibling);
						dragRow.style.transform = '';
						startClientY = e.clientY;
					}
				}
			}
			const scrollMargin = 80;
			if (e.clientY < scrollMargin) window.scrollBy(0, -14);
			else if (e.clientY > window.innerHeight - scrollMargin) window.scrollBy(0, 14);
		};
		const onUp = () => {
			if (!dragRow) return;
			dragRow.classList.remove('reorder-dragging');
			dragRow.style.transform = '';
			dragRow.style.zIndex = '';
			dragRow.style.position = '';
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			document.removeEventListener('pointercancel', onUp);
			const newOrder = [...container.children].map(r => r.dataset.reorderId);
			dragRow = null;
			onReorder(newOrder);
		};
		container.addEventListener('pointerdown', (e) => {
			const handle = e.target.closest('.reorder-handle');
			if (!handle) return;
			const row = handle.closest('[data-reorder-id]');
			if (!row) return;
			e.preventDefault();
			dragRow = row;
			startClientY = e.clientY;
			row.style.position = 'relative';
			row.style.zIndex = '50';
			row.classList.add('reorder-dragging');
			document.addEventListener('pointermove', onMove, { passive: false });
			document.addEventListener('pointerup', onUp);
			document.addEventListener('pointercancel', onUp);
		});
	}
	_buildReorderRow(id, label, i, total, moveFn, extraBtn) {
		const row = document.createElement('div');
		row.className = 'reorder-row flex items-center gap-2 p-2 rounded bg-gray-950 border border-gray-700 transition-shadow';
		row.dataset.reorderId = id;
		const handle = document.createElement('div');
		handle.className = 'reorder-handle w-9 h-9 flex items-center justify-center text-gray-400 text-lg shrink-0 select-none rounded hover:bg-gray-800 active:bg-gray-700 cursor-grab';
		handle.style.touchAction = 'none';
		handle.textContent = '⠿';
		handle.title = 'Drag to reorder';
		const labelEl = document.createElement('span');
		labelEl.className = 'text-xs font-bold flex-grow truncate';
		labelEl.textContent = label;
		const btns = document.createElement('div');
		btns.className = 'flex gap-1 shrink-0';
		const upBtn = document.createElement('button');
		upBtn.type = 'button';
		upBtn.className = 'w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold disabled:opacity-20';
		upBtn.textContent = '▲';
		upBtn.disabled = i === 0;
		upBtn.onclick = () => moveFn(id, 'up');
		const downBtn = document.createElement('button');
		downBtn.type = 'button';
		downBtn.className = 'w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold disabled:opacity-20';
		downBtn.textContent = '▼';
		downBtn.disabled = i === total - 1;
		downBtn.onclick = () => moveFn(id, 'down');
		btns.appendChild(upBtn);
		btns.appendChild(downBtn);
		if (extraBtn) btns.appendChild(extraBtn);
		row.appendChild(handle);
		row.appendChild(labelEl);
		row.appendChild(btns);
		return row;
	}
	renderHeaderOrderList() {
		const container = document.getElementById('header-order-list');
		if (!container) return;
		const labels = this._headerBtnLabels();
		const order = this._headerBtnOrder();
		container.innerHTML = '';
		order.forEach((id, i) => {
				container.appendChild(this._buildReorderRow(id, labels[id] || id, i, order.length, (btnId, dir) => this._moveHeaderBtn(btnId, dir)));
		});
		this._setupDragReorder(container, (newOrder) => {
			const row = document.getElementById('header-btn-row');
			if (row) {
				newOrder.forEach(id => {
						const el = document.getElementById(id);
						if (el) row.appendChild(el);
				});
			}
			this.appSettings.headerBtnOrder = newOrder;
			this.callbacks.onSave();
			this.renderHeaderOrderList();
			this.rebuildInfiniteHeaderScroll();
		});
	}
	_generalToggleOrder() {
		const grid = document.getElementById('general-toggle-grid');
		if (!grid) return [];
		return [...grid.children].map(child => {
				const cb = child.querySelector('input[type="checkbox"]');
				return cb ? cb.id : null;
		}).filter(Boolean);
	}
	_generalToggleLabels() {
		return { autoBrightToggle: 'Auto Bright ☀️', autoDarkToggle: 'Auto Dark 🌙', randomThemeToggle: 'Random Theme 🎲', headerThemeCycleToggle: 'Theme Cycle 🎨', headerCycleInputToggle: 'Cycle Input 🔀', headerModeSwitchToggle: 'Mode Switch 🎮', headerAddMachineToggle: 'Add Machine ➕', bossToggle: 'Boss Mode 🌑', headerUiSizeToggle: 'UI Size 🔍±', headerSeqSizeToggle: 'Sequence Size 🔢±', headerVolumeToggle: 'Volume 🔊±', headerSpeedToggle: 'Speed 🐇±', autoHideHeaderToggle: 'Auto Hide Header 👻', headerInfiniteScrollToggle: 'Infinite Header Scroll ♾️',flickHeaderToggle: 'Flick Header Buttons 💨', restoreHeaderToggle: 'Restore Header Gesture 🪄', headerPlayToggle: 'Play ▶️', headerDeleteToggle: 'Delete ⌫', headerSettingsToggle: 'Settings ⚙️', headerHelpToggle: 'Help 📚', headerRedeemToggle: 'Redeem 🆔', headerShareToggle: 'Share 📤', hideIntroToggle: 'Hide Intro', headerUndoToggle: 'Undo ↩️', timerToggle: 'Timer ⏱️', autotimerToggle: 'Auto Timer 🚀', counterToggle: 'Counter #', autocounterToggle: 'Auto Counter ➕', headerNotepadToggle: 'Notepad 📝', inputRegulatorToggle: 'Input Regulator 🚦', hapticsToggle: 'Haptics 📳', upsidedownToggle: 'Upside Down 🙃', portraitLockToggle: 'Portrait Lock 🔒', landscapeLockToggle: 'Landscape Lock 🔐', fullscreenToggle: 'Full Screen 🔲', biggerToggle: 'Bigger Buttons', ecoToggle: 'Eco Mode 🔋', wakelockToggle: 'Wake Lock 💡', positionSwapToggle: 'Position Swap 🔄', landscapeInputResizeToggle: 'Adjust Input Area ↔️', pipToggle: 'Picture in Picture 🪟', dndToggle: 'Do Not Disturb 🔕', pinnedModeToggle: 'Pinned Mode 📌', arcamToggle: 'AR Mode 📸', arAutoCloseGeneralToggle: 'AR Auto Close 🚪', voiceToggle: 'Voice Input 🎤', voicecommandsToggle: 'Voice Commands', toneToggle: 'Tone Cadence Mode 🎵', touchToggle: 'Touch Gesture', handToggle: 'Hand Gestures 🖐️', skeletonDebugToggle: 'Hand Skeleton Overlay 🦴', handsignalsToggle: 'Hand Signals 🖐️', handednessFlipToggle: 'Swap Left/Right Hands 🔄', volgesToggle: 'Vol. Gesture 🔊', speedToggle: 'Speed Gesture ⚡', headerResetToggle: 'Reset ♻️', headerNukeToggle: 'Nuke ☢️' };
	}
	_moveGeneralToggle(id, direction) {
		const grid = document.getElementById('general-toggle-grid');
		if (!grid) return;
		const order = this._generalToggleOrder();
		const i = order.indexOf(id);
		const j = direction === 'up' ? i - 1 : i + 1;
		if (i === -1 || j < 0 || j >= order.length) return;
		[order[i], order[j]] = [order[j], order[i]];
		order.forEach(cbId => {
				const cb = document.getElementById(cbId);
				if (cb && cb.parentElement) grid.appendChild(cb.parentElement);
		});
		this.appSettings.generalToggleOrder = order;
		this.callbacks.onSave();
		this.renderGeneralOrderList();
	}
	_toggleGeneralToggleVisibility(id) {
		const cb = document.getElementById(id);
		if (!cb || !cb.parentElement) return;
		if (!Array.isArray(this.appSettings.hiddenGeneralToggles)) this.appSettings.hiddenGeneralToggles = [];
		const hidden = this.appSettings.hiddenGeneralToggles;
		const idx = hidden.indexOf(id);
		if (idx === -1) {
			hidden.push(id);
			cb.parentElement.classList.add('hidden');
		} else {
			hidden.splice(idx, 1);
			cb.parentElement.classList.remove('hidden');
		}
		this.callbacks.onSave();
		this.renderGeneralOrderList();
	}
	applySavedGeneralToggleOrder() {
		const grid = document.getElementById('general-toggle-grid');
		if (!grid) return;
		const saved = this.appSettings.generalToggleOrder;
		const current = this._generalToggleOrder();
		if (Array.isArray(saved) && saved.length > 0) {
			const sameSet = saved.length === current.length && saved.every(id => current.includes(id));
			if (sameSet) {
				saved.forEach(id => {
						const cb = document.getElementById(id);
						if (cb && cb.parentElement) grid.appendChild(cb.parentElement);
				});
			}
		}
		if (Array.isArray(this.appSettings.hiddenGeneralToggles)) {
			this.appSettings.hiddenGeneralToggles.forEach(id => {
					const cb = document.getElementById(id);
					if (cb && cb.parentElement) cb.parentElement.classList.add('hidden');
			});
		}
	}
	renderGeneralOrderList() {
		const container = document.getElementById('general-order-list');
		if (!container) return;
		const labels = this._generalToggleLabels();
		const order = this._generalToggleOrder();
		const hidden = Array.isArray(this.appSettings.hiddenGeneralToggles) ? this.appSettings.hiddenGeneralToggles : [];
		container.innerHTML = '';
		order.forEach((id, i) => {
				const isHidden = hidden.includes(id);
				const hideBtn = document.createElement('button');
				hideBtn.type = 'button';
				hideBtn.className = 'w-7 h-7 rounded text-xs font-bold ' + (isHidden ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white');
				hideBtn.textContent = isHidden ? '🚫' : '👁️';
				hideBtn.title = isHidden ? 'Hidden - tap to show' : 'Tap to hide';
				hideBtn.onclick = () => this._toggleGeneralToggleVisibility(id);
				const row = this._buildReorderRow(id, labels[id] || id, i, order.length, (tid, dir) => this._moveGeneralToggle(tid, dir), hideBtn);
				if (isHidden) row.querySelector('.flex-grow').classList.add('opacity-40');
				container.appendChild(row);
		});
		this._setupDragReorder(container, (newOrder) => {
			const grid = document.getElementById('general-toggle-grid');
			if (grid) {
				newOrder.forEach(cbId => {
						const cb = document.getElementById(cbId);
						if (cb && cb.parentElement) grid.appendChild(cb.parentElement);
				});
			}
			this.appSettings.generalToggleOrder = newOrder;
			this.callbacks.onSave();
			this.renderGeneralOrderList();
		});
	}
	applyHeaderScale() {
		const row = document.getElementById('header-btn-row');
		if (!row) return;
		const scale = (typeof getEffectiveHeaderScale === 'function' ? getEffectiveHeaderScale() : (this.appSettings.headerIconScale || 100)) / 100;
		row.style.setProperty('--header-icon-scale', scale);
		const headerTimer = document.getElementById('headertimerbtn');
		const headerCounter = document.getElementById('headercounterbtn');
		if (headerTimer) headerTimer.style.fontSize = (0.75 * scale) + 'rem';
		if (headerCounter) headerCounter.style.fontSize = (1.2 * scale) + 'rem';
		this.updateSequenceContainerOffset();
	}
	updateSequenceContainerOffset() {
		const header = document.getElementById('aux-control-header');
		const seq = document.getElementById('sequence-container');
		const app = document.getElementById('app');
		if (!header || !seq || !app) return;
		const targetGapPx = parseFloat(getComputedStyle(document.documentElement).fontSize) / 2;
		const appPaddingTop = parseFloat(getComputedStyle(app).paddingTop) || 0;
		requestAnimationFrame(() => {
				requestAnimationFrame(() => {
						const isLandscapeNow = window.matchMedia('(orientation: landscape)').matches;
						const isSwapped = document.body.classList.contains('layout-swapped');
						// Portrait swap moves the input footer to the top, and #app's own padding-top
						// (set in applyPositionSwapOffsets) already accounts for header+footer height there,
						// so the sequence container needs no extra offset in that case. Landscape swap moves
						// the footer to the side instead - the header stays pinned at the top regardless -
						// so the sequence container still needs to clear the header itself, or header
						// buttons end up rendered underneath (and covered by) the sequence numbers.
						if (isSwapped && !isLandscapeNow) {
							seq.style.paddingTop = '0px';
						} else {
							const userExtra = (typeof getEffectiveHeaderPadding === 'function') ? getEffectiveHeaderPadding() : (this.appSettings.headerPadding || 0);
							// The header's live height measurement is unreliable while Portrait Lock's
							// compensation is active (position:fixed within a rotated ancestor), so its
							// natural height is measured and cached whenever unlocked - where measurement
							// is reliable - and that cached value is reused while locked instead of
							// re-measuring live.
							const isRotating = document.body.dataset.rotate === '90' || document.body.dataset.rotate === '270';
							let headerHeight;
							if (isRotating && this._cachedHeaderHeight) {
								headerHeight = this._cachedHeaderHeight;
							} else {
								headerHeight = header.getBoundingClientRect().height;
								if (!isRotating && headerHeight > 0) this._cachedHeaderHeight = headerHeight;
							}
							const total = headerHeight + targetGapPx + userExtra - appPaddingTop;
							seq.style.paddingTop = Math.max(0, total) + 'px';
						}
				});
		});
	}
	applyFontScale() {
		document.body.style.setProperty('--app-font-scale', (this.appSettings.appFontScale || 100) / 100);
	}
	applyInputFontScale() {
		const val = typeof getEffectiveInputFontSize === 'function' ? getEffectiveInputFontSize() : (this.appSettings.appInputFontScale || 100);
		document.body.style.setProperty('--input-font-scale', val / 100);
	}
	applyInputBtnScale() {
		// Inherently fixed: Relies on getEffectiveInputBtnSize which correctly maps split33's 150
		const val = typeof getEffectiveInputBtnSize === 'function' ? getEffectiveInputBtnSize() : (this.appSettings.appInputBtnScale || 100);
		document.body.style.setProperty('--input-btn-scale', val / 100);
	}
	applyEcoModeConfig() {
		const cfg = this.appSettings.ecoModeConfig || {};
		const active = this.appSettings.isEcoModeEnabled;
		// Theme switch: remember whatever theme was active, drop to the chosen eco theme while
		// eco mode runs, restore it automatically when eco mode turns back off.
		if (cfg.themeSwitch) {
			if (active) {
				if (!this._ecoPrevTheme) this._ecoPrevTheme = this.appSettings.activeTheme;
				this.appSettings.activeTheme = cfg.ecoTheme || 'night';
			} else if (this._ecoPrevTheme) {
				this.appSettings.activeTheme = this._ecoPrevTheme;
				this._ecoPrevTheme = null;
			}
			if (typeof applyTheme === 'function') applyTheme(this.appSettings.activeTheme);
		}
		// Wake lock limit: release the screen wake lock automatically after N seconds instead
		// of holding it indefinitely, so eco mode doesn't defeat the point of screen timeout.
		if (this._ecoWakeLockTimer) {
			clearTimeout(this._ecoWakeLockTimer);
			this._ecoWakeLockTimer = null;
		}
		if (active && cfg.limitWakeLock) {
			const seconds = cfg.wakeLockLimitSeconds || 300;
			this._ecoWakeLockTimer = setTimeout(() => {
				if (window.__activeWakeLock && typeof window.__activeWakeLock.release === 'function') {
					window.__activeWakeLock.release().catch(() => {});
				}
			}, seconds * 1000);
		}
		// Ambient light sensor: genuinely stops the sensor's continuous polling (real battery
		// cost) rather than just recording a preference nobody reads. Proximity sensor is left
		// alone here - it already has its own independent eco-mode awareness in
		// updateProximitySensorState() for the header auto-show feature.
		if (typeof window.updateAmbientSensorState === 'function') {
			const wantAmbient = !(active && cfg.disableAmbientSensor);
			window.__ecoAmbientOverride = !wantAmbient;
			window.updateAmbientSensorState(true);
		}
		// Camera/mic quality: a shared global that every getUserMedia call site (AR camera,
		// hand tracking, pitch-detection mic) reads when building its constraints, so a single
		// eco setting genuinely caps resolution/frameRate/sample rate everywhere at once instead
		// of needing a separate toggle per camera.
		window.__ecoCameraQuality = active ? (cfg.cameraQuality || 'full') : 'full';
		// Screen dim: a real, visible full-screen overlay - the web platform has no API to
		// control actual hardware display brightness, so this is an honest visual substitute
		// rather than a setting that silently does nothing.
		const dimOverlay = document.getElementById('eco-dim-overlay');
		if (dimOverlay) {
			const dimPct = active ? Math.min(60, Math.max(0, cfg.screenDimPct || 0)) : 0;
			dimOverlay.style.opacity = (dimPct / 100).toString();
		}
		this.callbacks.onSave();
	}
	initEcoModeConfigUI() {
		const cfg = this.appSettings.ecoModeConfig || {};
		const checkboxMap = {
			'eco-theme-switch-toggle': 'themeSwitch',
			'eco-wakelock-toggle': 'limitWakeLock',
			'eco-ambient-toggle': 'disableAmbientSensor'
		};
		Object.keys(checkboxMap).forEach(elId => {
			const el = document.getElementById(elId);
			if (!el) return;
			el.checked = !!cfg[checkboxMap[elId]];
			el.onchange = (e) => {
				this.appSettings.ecoModeConfig[checkboxMap[elId]] = e.target.checked;
				this.applyEcoModeConfig();
			};
		});
		const themeSel = document.getElementById('eco-theme-select');
		if (themeSel) {
			themeSel.value = cfg.ecoTheme || 'night';
			themeSel.onchange = (e) => {
				this.appSettings.ecoModeConfig.ecoTheme = e.target.value;
				this.applyEcoModeConfig();
			};
		}
		const wakeLockSel = document.getElementById('eco-wakelock-limit-select');
		if (wakeLockSel) {
			wakeLockSel.value = String(cfg.wakeLockLimitSeconds || 300);
			wakeLockSel.onchange = (e) => {
				this.appSettings.ecoModeConfig.wakeLockLimitSeconds = parseInt(e.target.value, 10);
				this.applyEcoModeConfig();
			};
		}
		const cameraSel = document.getElementById('eco-camera-quality-select');
		if (cameraSel) {
			cameraSel.value = cfg.cameraQuality || 'full';
			cameraSel.onchange = (e) => {
				this.appSettings.ecoModeConfig.cameraQuality = e.target.value;
				this.applyEcoModeConfig();
			};
		}
		const hapticsSel = document.getElementById('eco-haptics-select');
		if (hapticsSel) {
			hapticsSel.value = cfg.hapticsLevel || 'normal';
			hapticsSel.onchange = (e) => {
				this.appSettings.ecoModeConfig.hapticsLevel = e.target.value;
				this.applyEcoModeConfig();
			};
		}
		const volumeSlider = document.getElementById('eco-volume-slider');
		const volumeVal = document.getElementById('eco-volume-val');
		if (volumeSlider) {
			const v = (cfg.volumePct === undefined || cfg.volumePct === null) ? 100 : cfg.volumePct;
			volumeSlider.value = String(v);
			if (volumeVal) volumeVal.textContent = v + '%';
			volumeSlider.oninput = (e) => {
				const val = parseInt(e.target.value, 10);
				this.appSettings.ecoModeConfig.volumePct = val;
				if (volumeVal) volumeVal.textContent = val + '%';
				this.applyEcoModeConfig();
			};
		}
		const dimSlider = document.getElementById('eco-dim-slider');
		const dimVal = document.getElementById('eco-dim-val');
		if (dimSlider) {
			const d = cfg.screenDimPct || 0;
			dimSlider.value = String(d);
			if (dimVal) dimVal.textContent = d + '%';
			dimSlider.oninput = (e) => {
				const val = parseInt(e.target.value, 10);
				this.appSettings.ecoModeConfig.screenDimPct = val;
				if (dimVal) dimVal.textContent = val + '%';
				this.applyEcoModeConfig();
			};
		}
	}
	renderFullProfileList() {
		const container = document.getElementById('full-profile-list');
		if (!container) return;
		const profiles = this.appSettings.savedFullProfiles || {};
		container.innerHTML = '';
		const ids = Object.keys(profiles);
		if (ids.length === 0) {
			const empty = document.createElement('p');
			empty.className = 'text-[10px] text-gray-500 italic';
			empty.textContent = 'No saved profiles yet.';
			container.appendChild(empty);
			return;
		}
		ids.forEach(id => {
			const p = profiles[id];
			const row = document.createElement('div');
			row.className = 'flex items-center gap-2 p-2 rounded bg-gray-950 border border-gray-700';
			const label = document.createElement('span');
			label.className = 'text-xs font-bold flex-grow truncate';
			label.textContent = p.name || id;
			const loadBtn = document.createElement('button');
			loadBtn.type = 'button';
			loadBtn.className = 'px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white font-bold shrink-0';
			loadBtn.textContent = 'Load';
			loadBtn.onclick = () => this.loadFullProfile(id);
			const delBtn = document.createElement('button');
			delBtn.type = 'button';
			delBtn.className = 'px-3 py-1.5 text-xs bg-red-700 hover:bg-red-600 rounded text-white font-bold shrink-0';
			delBtn.textContent = '🗑️';
			delBtn.onclick = () => this.deleteFullProfile(id);
			row.appendChild(label);
			row.appendChild(loadBtn);
			row.appendChild(delBtn);
			container.appendChild(row);
		});
	}
	saveFullProfile(name) {
		if (!name || !name.trim()) return;
		if (!this.appSettings.savedFullProfiles) this.appSettings.savedFullProfiles = {};
		const id = 'p_' + Date.now();
		const snapshot = (typeof diffAgainstDefaults === 'function') ? diffAgainstDefaults(this.appSettings, DEFAULT_APP) : {};
		this.appSettings.savedFullProfiles[id] = { name: name.trim(), snapshot, timestamp: Date.now() };
		this.callbacks.onSave();
		this.renderFullProfileList();
		if (typeof showToast === 'function') showToast(`Saved profile "${name.trim()}" 💾`);
	}
	loadFullProfile(id) {
		const profile = this.appSettings.savedFullProfiles && this.appSettings.savedFullProfiles[id];
		if (!profile || typeof mergeWithDefaults !== 'function') return;
		const preservedProfiles = this.appSettings.savedFullProfiles;
		const merged = mergeWithDefaults(profile.snapshot, DEFAULT_APP);
		Object.keys(this.appSettings).forEach(k => delete this.appSettings[k]);
		Object.assign(this.appSettings, merged);
		this.appSettings.savedFullProfiles = preservedProfiles;
		this.callbacks.onSave();
		if (typeof updateAllChrome === 'function') updateAllChrome();
		this.updateUIFromSettings();
		this.updateHeaderVisibility();
		this.renderFullProfileList();
		if (typeof showToast === 'function') showToast(`Loaded profile "${profile.name}" ✅`);
	}
	deleteFullProfile(id) {
		if (!this.appSettings.savedFullProfiles || !this.appSettings.savedFullProfiles[id]) return;
		if (!confirm(`Delete profile "${this.appSettings.savedFullProfiles[id].name}"?`)) return;
		delete this.appSettings.savedFullProfiles[id];
		this.callbacks.onSave();
		this.renderFullProfileList();
	}
	applyRowMax() {
		const seqContainer = document.getElementById('sequence-container');
		if (!seqContainer) return;
		// Per-viewport Row Max overrides the global Row Max setting while that bucket is active.
		const vp = (typeof getViewportProfile === 'function') ? getViewportProfile() : null;
		const rowMax = (vp && vp.rowMax !== undefined && vp.rowMax !== null) ? String(vp.rowMax) : (this.appSettings.appRowMax || 'none');
		
		if (rowMax === 'none') {
			seqContainer.style.removeProperty('--row-max-width');
		} else {
			const scale = (typeof getEffectiveSeqScaleMultiplier === 'function') ? getEffectiveSeqScaleMultiplier() : (this.appSettings.uiScaleMultiplier || 1.0);
			const cardSize = 40 * scale;
			const gap = 8;
			const count = parseInt(rowMax, 10);
			
			const card = seqContainer.querySelector(':scope > div');
			let horizontalPadding;
			if (card) {
				const cs = getComputedStyle(card);
				horizontalPadding = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
			} else {
				horizontalPadding = 32 * ((this.appSettings.globalUiScale || 100) / 100);
			}
			
			const maxWidth = (cardSize * count) + (gap * (count - 1)) + horizontalPadding + 1;
			seqContainer.style.setProperty('--row-max-width', maxWidth + 'px');
		}
	}
	applyHeaderPadding() {
		this.updateSequenceContainerOffset();
	}
	applyInputsPadding() {
		const val = (typeof getEffectiveInputsPadding === 'function') ? getEffectiveInputsPadding() : (this.appSettings.inputsPadding || 0);
		document.body.style.setProperty('--inputs-padding-extra', val + 'px');
	}
	rebuildInfiniteHeaderScroll() {
		const row = document.getElementById('header-btn-row');
		if (!row) return;
		row.querySelectorAll('[data-clone-id]').forEach(el => el.remove());
		if (!this.appSettings.isHeaderInfiniteScrollEnabled) {
			row._infiniteSetWidth = null;
			row._infiniteRealStart = undefined;
			row.scrollLeft = 0;
			return;
		}
		const visibleIds = this._headerBtnOrder().filter(id => {
				const el = document.getElementById(id);
				return el && !el.classList.contains('hidden');
		});
		if (visibleIds.length === 0) return;
		const buildCloneSet = () => {
			const frag = document.createDocumentFragment();
			visibleIds.forEach(id => {
					const source = document.getElementById(id);
					const clone = source.cloneNode(true);
					clone.removeAttribute('id');
					clone.dataset.cloneId = id;
					frag.appendChild(clone);
			});
			return frag;
		};
		const firstReal = document.getElementById(visibleIds[0]);
		row.insertBefore(buildCloneSet(), firstReal);
		row.appendChild(buildCloneSet());
		if (!row._cloneForwardingBound) {
			row._cloneForwardingBound = true;
			['click', 'mousedown', 'mouseup', 'mouseleave', 'touchstart', 'touchend'].forEach(type => {
					row.addEventListener(type, (e) => {
							const cloneEl = e.target.closest('[data-clone-id]');
							if (!cloneEl) return;
							const real = document.getElementById(cloneEl.dataset.cloneId);
							if (!real) return;
							const forwardType = type === 'touchstart' ? 'mousedown' : type === 'touchend' ? 'mouseup' : type;
							real.dispatchEvent(new MouseEvent(forwardType, { bubbles: true, cancelable: true }));
						}, { passive: true });
			});
		}
		requestAnimationFrame(() => {
				const realFirst = document.getElementById(visibleIds[0]);
				const realLast = document.getElementById(visibleIds[visibleIds.length - 1]);
				if (!realFirst || !realLast) return;
				const setWidth = (realLast.offsetLeft + realLast.offsetWidth) - realFirst.offsetLeft;
				row.scrollLeft = realFirst.offsetLeft;
				row._infiniteSetWidth = setWidth;
				row._infiniteRealStart = realFirst.offsetLeft;
		});
		if (!row._infiniteScrollBound) {
			row._infiniteScrollBound = true;
			row.addEventListener('scroll', () => {
					const setWidth = row._infiniteSetWidth;
					const realStart = row._infiniteRealStart;
					if (!setWidth || realStart === undefined) return;
					if (row.scrollLeft <= realStart - setWidth + 2) {
						row.scrollLeft += setWidth;
					} else if (row.scrollLeft >= realStart + setWidth - 2) {
						row.scrollLeft -= setWidth;
					}
			});
			row.addEventListener('click', (e) => {
					const cloneBtn = e.target.closest('[data-clone-id]');
					if (!cloneBtn) return;
					const real = document.getElementById(cloneBtn.dataset.cloneId);
					if (real) real.click();
			});
			const syncObserver = new MutationObserver((mutations) => {
					const seen = new Set();
					mutations.forEach(m => {
							const real = m.target.nodeType === 3 ? m.target.parentElement : m.target;
							if (!real || !real.id || seen.has(real.id)) return;
							seen.add(real.id);
							const clones = row.querySelectorAll(`[data-clone-id="${real.id}"]`);
							clones.forEach(c => { c.textContent = real.textContent; });
					});
			});
			syncObserver.observe(row, { characterData: true, childList: true, subtree: true });
		}
	}
	hexToHsl(hex) { let r = 0, g = 0, b = 0; if (hex.length === 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; } else if (hex.length === 7) { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; } r /= 255; g /= 255; b /= 255; let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0; if (delta === 0) h = 0; else if (cmax === r) h = ((g - b) / delta) % 6; else if (cmax === g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4; h = Math.round(h * 60); if (h < 0) h += 360; l = (cmax + cmin) / 2; s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1)); s = +(s * 100).toFixed(1); l = +(l * 100).toFixed(1); return [h, s, l]; }
	hslToHex(h, s, l) { s /= 100; l /= 100; let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0; if (0 <= h && h < 60) { r = c; g = x; b = 0; } else if (60 <= h && h < 120) { r = x; g = c; b = 0; } else if (120 <= h && h < 180) { r = 0; g = c; b = x; } else if (180 <= h && h < 240) { r = 0; g = x; b = c; } else if (240 <= h && h < 300) { r = x; g = 0; b = c; } else { r = c; g = 0; b = x; } r = Math.round((r + m) * 255).toString(16); g = Math.round((g + m) * 255).toString(16); b = Math.round((b + m) * 255).toString(16); if (r.length === 1) r = "0" + r; if (g.length === 1) g = "0" + g; if (b.length === 1) b = "0" + b; return "#" + r + g + b; }
	populateMappingUI() {
		if (!this.dom) return;
		if (!this.appSettings) return;
		if (!this.appSettings.touchGestureMappings || Object.keys(this.appSettings.touchGestureMappings).length === 0) {
			this.applyDefaultTouchGestureMappings();
		}
		this.applyDefaultMappingsIfEmpty();
		const tapSlider = document.getElementById('gesture-tap-slider');
		const swipeSlider = document.getElementById('gesture-swipe-slider');
		const tapVal = document.getElementById('gesture-tap-val');
		const swipeVal = document.getElementById('gesture-swipe-val');
		if (tapSlider) tapSlider.value = this.appSettings.touchGestureTapDelay || 300;
		if (swipeSlider) swipeSlider.value = this.appSettings.touchGestureSwipeDist || 30;
		if (tapVal) tapVal.textContent = (this.appSettings.touchGestureTapDelay || 300) + 'ms';
		if (swipeVal) swipeVal.textContent = (this.appSettings.touchGestureSwipeDist || 30) + 'px';
		{
			if(tapSlider) {
				tapSlider.oninput = (e) => {
					const val = parseInt(e.target.value);
					this.appSettings.touchGestureTapDelay = val;
					if(tapVal) tapVal.textContent = val + 'ms';
					this.callbacks.onSave();
				};
			}
			if(swipeSlider) {
				swipeSlider.oninput = (e) => {
					const val = parseInt(e.target.value);
					this.appSettings.touchGestureSwipeDist = val;
					if(swipeVal) swipeVal.textContent = val + 'px';
					this.callbacks.onSave();
				};
			}
			const moreSliders = [
				{ id: 'gesture-longpress-slider', valId: 'gesture-longpress-val', prop: 'touchGestureLongPressTime', unit: 'ms', def: 300 },
				{ id: 'gesture-tapprecision-slider', valId: 'gesture-tapprecision-val', prop: 'touchGestureTapPrecision', unit: 'px', def: 30 },
				{ id: 'gesture-spatial-slider', valId: 'gesture-spatial-val', prop: 'touchGestureSpatialThreshold', unit: 'px', def: 10 },
				{ id: 'gesture-longswipe-slider', valId: 'gesture-longswipe-val', prop: 'touchGestureLongSwipeThreshold', unit: 'px', def: 150 },
				{ id: 'gesture-multiswipe-slider', valId: 'gesture-multiswipe-val', prop: 'touchGestureMultiSwipeThreshold', unit: 'px', def: 10 },
				{ id: 'gesture-handcooldown-slider', valId: 'gesture-handcooldown-val', prop: 'handGestureCooldown', unit: 'ms', def: 2000 },
				{ id: 'gesture-handhold-slider', valId: 'gesture-handhold-val', prop: 'handHoldFrames', unit: '', def: 4 },
				{ id: 'voice-confidence-slider', valId: 'voice-confidence-val', prop: 'voiceConfidenceThreshold', unit: '%', def: 50 },
				{ id: 'tone-threshold-slider', valId: 'tone-threshold-val', prop: 'toneVolumeThreshold', unit: 'dB', def: -70 },
				{ id: 'gesture-anchordist-slider', valId: 'gesture-anchordist-val', prop: 'touchAnchorStillDistance', unit: 'px', def: 15 },
				{ id: 'gesture-anchorhold-slider', valId: 'gesture-anchorhold-val', prop: 'touchAnchorMinHoldTime', unit: 'ms', def: 150 },
				{ id: 'gesture-chordwindow-slider', valId: 'gesture-chordwindow-val', prop: 'touchChordSimultaneityWindow', unit: 'ms', def: 50 },
				{ id: 'gesture-handmotion-slider', valId: 'gesture-handmotion-val', prop: 'handMotionMinDistance', unit: '%', def: 12 },
				{ id: 'gesture-pinchprecision-slider', valId: 'gesture-pinchprecision-val', prop: 'handPinchThreshold', unit: '%', def: 6 },
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
			const restoreDefaultsBtn = document.getElementById('restore-sensitivity-defaults-btn');
			if (restoreDefaultsBtn) restoreDefaultsBtn.onclick = () => this.restoreSensitivityDefaults();
		}
		this.bindMappingEvents();
		return;
	}
	restoreSensitivityDefaults() {
		if (this.appSettings.isSliderLockEnabled) {
			showToast('Unlock sliders first 🔒');
			return;
		}
		['touchGestureTapDelay', 'touchGestureSwipeDist', 'touchGestureLongPressTime', 'touchGestureTapPrecision',
			'touchGestureSpatialThreshold', 'touchGestureLongSwipeThreshold', 'touchGestureMultiSwipeThreshold',
			'handGestureCooldown', 'handHoldFrames', 'voiceConfidenceThreshold', 'toneVolumeThreshold',
			'touchAnchorStillDistance', 'touchAnchorMinHoldTime', 'touchChordSimultaneityWindow',
			'handMotionMinDistance', 'handPinchThreshold'
		].forEach(p => delete this.appSettings[p]);
		this.populateMappingUI();
		this.callbacks.onSave();
		showToast('Sensitivity restored to defaults 🎛️');
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
		// Matches the UI tab's own dropdown pattern exactly: label stacked above a themed
		// .settings-input select, two per row - instead of the old hardcoded dark colors and
		// compact inline label/select pairing, which didn't match the rest of the app and looked
		// out of place next to everything else in Settings.
		let gridHtml = `<div class="grid grid-cols-2 gap-3">`;
		labels.forEach((label, index) => {
				const val = index + 1;
				let optionsHtml = `<optgroup label="Morse Patterns">`;
				optionsHtml += morseOptions.map(m => `<option value="${m}">${m}</option>`).join('');
				optionsHtml += `</optgroup>`;
				gridHtml += `
				<div>
				<label class="block text-xs font-bold mb-1 text-muted-custom">Value ${label}</label>
				<select class="settings-input w-full p-2 rounded text-sm font-semibold shadow-sm font-mono tracking-widest" data-morse-id="${val}">
				${optionsHtml}
				</select>
				</div>
				`;
		});
		gridHtml += `</div>`;
		container.innerHTML = `
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
						if(pattern.length) hapticPulse(pattern);
					}
				};
		});
	}
	applyDefaultTouchGestureMappings() {
		this.appSettings.touchGestureMappings = this.appSettings.touchGestureMappings || {};
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
		this.appSettings.touchGestureMappings = Object.assign({}, defaults, this.appSettings.touchGestureMappings || {});
	}
	applyDefaultMappingsIfEmpty() {
		if (this.appSettings.mappings && Object.keys(this.appSettings.mappings).length > 0) return;
		this.appSettings.mappings = {};
		const ensure = (key) => {
			if (!this.appSettings.mappings[key]) this.appSettings.mappings[key] = { touch: 'none', handGesture: 'none', morse: '', handSide: 'any' };
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
class ToneEngine {
	constructor(onInputCallback, onDebug) {
		this.onInput = onInputCallback;
		this.onDebug = onDebug || null;
		this.audioCtx = null;
		this.analyser = null;
		this.micSrc = null;
		this.isActive = false;
		this.loopId = null;
		this.TONES = TONE_TABLE;
		this.audioThresh = -70;
		this.currentTone = null;
		this.toneStartTime = 0;
		this.lastToneEndTime = 0;
	}
	async start() {
		if (this.isActive) return;
		try {
			this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
			this.analyser = this.audioCtx.createAnalyser();
			this.analyser.fftSize = 4096;
			const stream = await navigator.mediaDevices.getUserMedia({
					audio: getEcoAudioConstraints({
						echoCancellation: false,
						noiseSuppression: false,
						autoGainControl: false
					})
			});
			this.micSrc = this.audioCtx.createMediaStreamSource(stream);
			this.micSrc.connect(this.analyser);
			this.isActive = true;
			this.lastToneEndTime = 0;
			this.currentTone = null;
			this.loop();
			console.log("🎵 Tone Cadence Engine: LISTENING");
		} catch (e) {
			console.error("Tone Engine failed to get microphone access:", e);
			if (this.onDebug) this.onDebug({
					error: e.name || 'Unknown'
			});
		}
	}
	stop() {
		this.isActive = false;
		if (this.loopId) cancelAnimationFrame(this.loopId);
		if (this.audioCtx && this.audioCtx.state === 'running') {
			this.audioCtx.suspend();
		}
		if (this.micSrc) {
			this.micSrc.mediaStream.getTracks().forEach(t => t.stop());
			this.micSrc.disconnect();
		}
		this.currentTone = null;
		console.log("🛑 Tone Cadence Engine: STOPPED");
	}
	_detectPitch(buffer, sampleRate) {
		const SIZE = buffer.length;
		let rms = 0;
		for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
		rms = Math.sqrt(rms / SIZE);
		if (rms < 0.01) return -1;
		const minLag = Math.floor(sampleRate / 950);
		const maxLag = Math.ceil(sampleRate / 180);
		const usableSize = SIZE - maxLag;
		if (usableSize <= 0) return -1;
		const corr = new Float32Array(maxLag + 1);
		for (let lag = minLag; lag <= maxLag; lag++) {
			let c = 0;
			for (let i = 0; i < usableSize; i++) c += buffer[i] * buffer[i + lag];
			corr[lag] = c;
		}
		let bestLag = -1,
		bestCorr = -1;
		for (let lag = minLag; lag <= maxLag; lag++) {
			if (corr[lag] > bestCorr) {
				bestCorr = corr[lag];
				bestLag = lag;
			}
		}
		if (bestLag <= 0) return -1;
		const strongThreshold = bestCorr * 0.85;
		for (let lag = minLag; lag < bestLag; lag++) {
			if (corr[lag] >= strongThreshold) {
				bestLag = lag;
				bestCorr = corr[lag];
				break;
			}
		}
		let refinedLag = bestLag;
		if (bestLag > minLag && bestLag < maxLag) {
			const c0 = corr[bestLag - 1],
			c1 = bestCorr,
			c2 = corr[bestLag + 1];
			const denom = c0 - 2 * c1 + c2;
			if (denom !== 0) refinedLag = bestLag + 0.5 * (c0 - c2) / denom;
		}
		return refinedLag > 0 ? sampleRate / refinedLag : -1;
	}
	_effectiveTones() {
		const cal = (typeof appSettings !== 'undefined' && appSettings.toneCalibration && appSettings.toneCalibration.notes) || {};
		return this.TONES.map(t => ({
					n: t.n,
					name: t.name,
					f: (typeof cal[t.n] === 'number' ? cal[t.n] : t.f)
		}));
	}
	_matchNearestTone(freq) {
		let best = null,
		bestDist = Infinity;
		for (const t of this._effectiveTones()) {
			const dist = Math.abs(t.f - freq);
			if (dist < bestDist) {
				bestDist = dist;
				best = t;
			}
		}
		return (best && bestDist < best.f * 0.04) ? best : null;
	}
	_listenForPitch(targetIdealFreq, windowMs) {
		const readings = [];
		const start = performance.now();
		return new Promise(resolve => {
				const sample = () => {
					const timeData = new Float32Array(this.analyser.fftSize);
					this.analyser.getFloatTimeDomainData(timeData);
					const freqData = new Float32Array(this.analyser.frequencyBinCount);
					this.analyser.getFloatFrequencyData(freqData);
					let maxVal = -Infinity;
					for (let i = 0; i < freqData.length; i++)
					if (freqData[i] > maxVal) maxVal = freqData[i];
					if (maxVal > (appSettings.toneVolumeThreshold || this.audioThresh)) {
						const freq = this._detectPitch(timeData, this.audioCtx.sampleRate);
						if (freq > 0 && Math.abs(freq - targetIdealFreq) < targetIdealFreq * 0.3) {
							readings.push(freq);
						}
					}
					if (performance.now() - start >= windowMs) {
						if (readings.length === 0) return resolve(null);
						readings.sort((a, b) => a - b);
						resolve(readings[Math.floor(readings.length / 2)]);
					} else {
						requestAnimationFrame(sample);
					}
				};
				requestAnimationFrame(sample);
		});
	}
	loop() {
		if (!this.isActive) return;
		const timeData = new Float32Array(this.analyser.fftSize);
		this.analyser.getFloatTimeDomainData(timeData);
		const freqData = new Float32Array(this.analyser.frequencyBinCount);
		this.analyser.getFloatFrequencyData(freqData);
		let maxVal = -Infinity;
		for (let i = 0; i < freqData.length; i++)
		if (freqData[i] > maxVal) maxVal = freqData[i];
		const now = Date.now();
		if (maxVal > (appSettings.toneVolumeThreshold || this.audioThresh)) {
			const freq = this._detectPitch(timeData, this.audioCtx.sampleRate);
			const match = freq > 0 ? this._matchNearestTone(freq) : null;
			if (this.onDebug) this.onDebug({
					freq: freq > 0 ? Math.round(freq) : null,
					note: match ? match.n : null,
					db: Math.round(maxVal)
			});
			if (match) {
				if (!this.currentTone) {
					this.currentTone = match.n;
					this.toneStartTime = now;
				} else if (this.currentTone !== match.n) {
					this.currentTone = match.n;
					this.toneStartTime = now;
				}
			}
		} else {
			if (this.onDebug) this.onDebug({
					freq: null,
					note: null,
					db: Math.round(maxVal)
			});
			if (this.currentTone) {
				const toneDuration = now - this.toneStartTime;
				const silenceDuration = this.toneStartTime - this.lastToneEndTime;
				const isToneValid = toneDuration >= 100 && toneDuration <= 350;
				const isSilenceValid = this.lastToneEndTime === 0 || silenceDuration >= 600 && silenceDuration <= 1100;
				if (isToneValid && isSilenceValid) {
					this.onInput(this.currentTone);
				}
				this.lastToneEndTime = now;
				this.currentTone = null;
			}
		}
		this.loopId = requestAnimationFrame(() => this.loop());
	}
}
class VoiceCommander {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.recognition = null;
		this.isListening = false;
		this.restartTimer = null;
		this.vocab = {
			'1': '1',
			'one': '1',
			'won': '1',
			'2': '2',
			'two': '2',
			'to': '2',
			'too': '2',
			'3': '3',
			'three': '3',
			'tree': '3',
			'4': '4',
			'four': '4',
			'for': '4',
			'fore': '4',
			'5': '5',
			'five': '5',
			'6': '6',
			'six': '6',
			'7': '7',
			'seven': '7',
			'8': '8',
			'eight': '8',
			'ate': '8',
			'9': '9',
			'nine': '9',
			'10': '10',
			'ten': '10',
			'tin': '10',
			'11': '11',
			'eleven': '11',
			'12': '12',
			'twelve': '12',
			'a': 'A',
			'hey': 'A',
			'b': 'B',
			'bee': 'B',
			'be': 'B',
			'c': 'C',
			'see': 'C',
			'sea': 'C',
			'd': 'D',
			'dee': 'D',
			'e': 'E',
			'f': 'F',
			'g': 'G',
			'jee': 'G'
		};
		this.commandVocab = {
			'play': 'CMD_PLAY',
			'start': 'CMD_PLAY',
			'go': 'CMD_PLAY',
			'stop': 'CMD_STOP',
			'pause': 'CMD_STOP',
			'clear': 'CMD_CLEAR',
			'reset': 'CMD_CLEAR',
			'delete': 'CMD_DELETE',
			'backspace': 'CMD_DELETE',
			'back': 'CMD_DELETE',
			'undo': 'CMD_UNDO',
			'settings': 'CMD_SETTINGS',
			'options': 'CMD_SETTINGS',
			'louder': 'CMD_VOLUME_UP',
			'quieter': 'CMD_VOLUME_DOWN',
			'faster': 'CMD_SPEED_UP',
			'slower': 'CMD_SPEED_DOWN'
		};
		this.initEngine();
	}
	initEngine() {
		if (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
			const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
			const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
			this.recognition = new SpeechRec();
			if (SpeechGrammarList) {
				const activeTrigger = appSettings.voiceTriggerWord || 'set';
				const targets = Object.keys(this.vocab);
				const commandWords = Object.keys(this.commandVocab);
				const whitelist = [activeTrigger, ...targets, ...commandWords].join(' | ');
				const grammar = `#JSGF V1.0; grammar appCommands; public <command> = ${whitelist} ;`;
				const speechRecognitionList = new SpeechGrammarList();
				speechRecognitionList.addFromString(grammar, 1);
				this.recognition.grammars = speechRecognitionList;
			}
			this.recognition.continuous = true;
			this.recognition.lang = 'en-US';
			this.recognition.interimResults = true;
			this.recognition.maxAlternatives = 1;
			this.recognition.onresult = event => this.handleResult(event);
			this.recognition.onend = () => this.handleEnd();
		}
	}
	toggle(active) {
		if (!this.recognition) return;
		if (active) {
			this.isListening = true;
			try {
				this.recognition.start();
			} catch (e) {}
			this.callbacks.onStatus(`Voice Active (Say '${appSettings.voiceTriggerWord.toUpperCase()}...') 🎙️`);
		} else {
			this.isListening = false;
			try {
				this.recognition.stop();
			} catch (e) {}
			clearTimeout(this.restartTimer);
			this.callbacks.onStatus("Voice Off 🔇");
		}
	}
	handleResult(event) {
		const activeTrigger = (appSettings.voiceTriggerWord || 'set').toLowerCase();
		for (let i = event.resultIndex; i < event.results.length; ++i) {
			const transcript = event.results[i][0].transcript.toLowerCase();
			const words = transcript.split(/\s+/).filter(w => w !== "");
			const confidence = event.results[i][0].confidence;
			const minConfidence = (appSettings.voiceConfidenceThreshold || 50) / 100;
			if (event.results[i].isFinal && confidence > 0 && confidence < minConfidence) {
				continue;
			}
			const triggerIdx = words.lastIndexOf(activeTrigger);
			if (triggerIdx !== -1 && triggerIdx < words.length - 1) {
				const nextWord = words[triggerIdx + 1];
				const cmd = this.commandVocab[nextWord];
				if (cmd) {
					this.callbacks.onCommand(cmd);
					this.recognition.abort();
					return;
				}
				const mappedValue = this.vocab[nextWord];
				if (mappedValue) {
					this.callbacks.onInput(mappedValue);
					this.recognition.abort();
					return;
				}
			}
		}
	}
	handleEnd() {
		if (this.isListening) {
			this.restartTimer = setTimeout(() => {
					try {
						this.recognition.start();
					} catch (e) {}
				}, 100);
		}
	}
}
function processHandData(landmarks) {
	const wrist = landmarks[0];
	const n = landmarks.map(p => ({
				x: p.x - wrist.x,
				y: p.y - wrist.y,
				z: p.z - wrist.z
	}));
	const dist3D = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
	const nWrist = n[0];
	const T = dist3D(nWrist, n[4]) > (dist3D(nWrist, n[2]) * 1.15) ? 1 : 0;
	const I = dist3D(nWrist, n[8]) > (dist3D(nWrist, n[6]) * 1.25) ? 1 : 0;
	const M = dist3D(nWrist, n[12]) > (dist3D(nWrist, n[10]) * 1.25) ? 1 : 0;
	const R = dist3D(nWrist, n[16]) > (dist3D(nWrist, n[14]) * 1.25) ? 1 : 0;
	const P = dist3D(nWrist, n[20]) > (dist3D(nWrist, n[18]) * 1.25) ? 1 : 0;
	const baseMask = (T << 4) | (I << 3) | (M << 2) | (R << 1) | P;
	const vec1x = n[17].x - n[5].x;
	const vec1y = n[17].y - n[5].y;
	const vec2x = n[9].x - nWrist.x;
	const vec2y = n[9].y - nWrist.y;
	const crossProduct = (vec1x * vec2y) - (vec1y * vec2x);
	const palmFacing = crossProduct > 0 ? 1 : 0;
	let handGestureID = (baseMask << 1) | palmFacing;
	const pinchThreshold = ((window.appSettings && window.appSettings.handPinchThreshold) || 5.5) / 100;
	const dThumbIndex = dist3D(n[4], n[8]);
	const dThumbMiddle = dist3D(n[4], n[12]);
	const dThumbRing = dist3D(n[4], n[16]);
	const dThumbPinky = dist3D(n[4], n[20]);
	const cx = (n[4].x + n[8].x + n[12].x + n[16].x + n[20].x) / 5;
	const cy = (n[4].y + n[8].y + n[12].y + n[16].y + n[20].y) / 5;
	const cz = (n[4].z + n[8].z + n[12].z + n[16].z + n[20].z) / 5;
	const centerTip = {x: cx, y: cy, z: cz};
	const isChefKiss = dist3D(n[4], centerTip) < 0.08 &&
	dist3D(n[8], centerTip) < 0.08 &&
	dist3D(n[12], centerTip) < 0.08;
	if (isChefKiss) {
		handGestureID = 104;
	} else if (dThumbIndex < pinchThreshold) {
		handGestureID = (M || R || P) ? 105 : 100;
	} else if (dThumbMiddle < pinchThreshold) {
		handGestureID = 101;
	} else if (dThumbRing < pinchThreshold) {
		handGestureID = 102;
	} else if (dThumbPinky < pinchThreshold) {
		handGestureID = 103;
	} else if (T === 1 && I === 0 && M === 0 && R === 0 && P === 0) {
		handGestureID = (n[4].y < n[2].y) ? 600 : 601;
	}
	return handGestureID;
}
window.processHandData = processHandData;
async function reacquireWakeLock() {
	if (document.visibilityState === 'visible' && appSettings.isWakeLockEnabled) {
		try {
			screenWakeLock = await navigator.wakeLock.request('screen');
		} catch (e) {
			console.warn('Wake Lock reacquire failed during visibility shift:', e);
		}
	}
}
async function initFirebaseAndComments() {
	try {
		const {
			initializeApp
		} = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js");
		const {
			getFirestore,
			enableIndexedDbPersistence,
			collection,
			addDoc,
			query,
			orderBy,
			limit,
			onSnapshot,
			serverTimestamp
		} = await import("https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js");
		const fbApp = initializeApp(firebaseConfig);
		db = getFirestore(fbApp);
		enableIndexedDbPersistence(db).catch(err => {
				if (err.code === 'failed-precondition') {
					console.log('Multiple tabs open, persistence can only be enabled in one.');
				} else if (err.code === 'unimplemented') {
					console.log('Browser does not support persistence');
				}
		});
		const submitBtn = document.getElementById('submit-comment-btn');
		const listContainer = document.getElementById('comments-list-container');
		const nameInput = document.getElementById('comment-username');
		const msgInput = document.getElementById('comment-message');
		if (submitBtn) {
			submitBtn.onclick = async () => {
				const username = nameInput.value.trim();
				const message = msgInput.value.trim();
				if (!username || !message) {
					alert("Please enter name and message.");
					return;
				}
				submitBtn.disabled = true;
				submitBtn.innerText = "Sending...";
				try {
					await addDoc(collection(db, "comments"), {
							username,
							message,
							timestamp: serverTimestamp()
					});
					msgInput.value = "";
					submitBtn.innerText = "Sent!";
					setTimeout(() => {
							submitBtn.disabled = false;
							submitBtn.innerText = "Send";
						}, 2000);
				} catch (e) {
					console.error("Error sending comment", e);
					submitBtn.innerText = "Error";
					submitBtn.disabled = false;
				}
			};
		}
		const q = query(collection(db, "comments"), orderBy("timestamp", "desc"), limit(50));
		onSnapshot(q, snapshot => {
				if (!listContainer) return;
				if (snapshot.empty) {
					listContainer.innerHTML = '<p class="text-center text-gray-500 text-xs">No comments yet.</p>';
					return;
				}
				listContainer.innerHTML = "";
				snapshot.forEach(doc => {
						const data = doc.data();
						const el = document.createElement('div');
						el.className = "p-3 mb-2 rounded-lg bg-black bg-opacity-20 border border-gray-700";
						el.dataset.commentId = doc.id;
						el.innerHTML = `<div class="flex justify-between items-start"><div class="flex-1"><p class="font-bold text-primary-app text-xs">${escapeHtml(data.username)}</p><p class="text-gray-300 text-sm">${escapeHtml(data.message)}</p></div></div>`;
						listContainer.appendChild(el);
				});
		});
	} catch (err) {
		console.warn('Firebase/comments unavailable (offline or blocked) - rest of the app is unaffected:', err.message);
	}
}
function escapeHtml(text) {
	if (!text) return "";
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function saveState() {
	localStorage.setItem(CONFIG.STORAGE_KEY_SETTINGS, JSON.stringify(appSettings));
	localStorage.setItem(CONFIG.STORAGE_KEY_STATE, JSON.stringify(appState));
}
window.saveState = saveState;
function bytesToBackupCode(bytes) {
	const base = BACKUP_ALPHABET.length;
	let big = 0n;
	for (let i = 0; i < bytes.length; i++) big = (big << 8n) | BigInt(bytes[i]);
	let out = '';
	if (big === 0n) out = BACKUP_ALPHABET[0];
	while (big > 0n) {
		out = BACKUP_ALPHABET[Number(big % BigInt(base))] + out;
		big = big / BigInt(base);
	}
	return out;
}
function backupCodeToBytes(code, byteLength) {
	const base = BACKUP_ALPHABET.length;
	const map = {};
	for (let i = 0; i < BACKUP_ALPHABET.length; i++) map[BACKUP_ALPHABET[i]] = i;
	let big = 0n;
	for (const ch of code) {
		if (!(ch in map)) throw new Error('Not a valid backup code');
		big = big * BigInt(base) + BigInt(map[ch]);
	}
	const bytes = new Uint8Array(byteLength);
	for (let i = byteLength - 1; i >= 0; i--) {
		bytes[i] = Number(big & 0xFFn);
		big = big >> 8n;
	}
	return bytes;
}
async function gzipCompress(text) {
	const bytes = new TextEncoder().encode(text);
	const cs = new CompressionStream('gzip');
	const writer = cs.writable.getWriter();
	writer.write(bytes);
	writer.close();
	const chunks = [];
	const reader = cs.readable.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}
	const totalLen = chunks.reduce((n, c) => n + c.length, 0);
	const out = new Uint8Array(totalLen);
	let offset = 0;
	for (const c of chunks) { out.set(c, offset); offset += c.length; }
	return out;
}
async function gzipDecompress(bytes) {
	const ds = new DecompressionStream('gzip');
	const writer = ds.writable.getWriter();
	writer.write(bytes);
	writer.close();
	const chunks = [];
	const reader = ds.readable.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}
	const totalLen = chunks.reduce((n, c) => n + c.length, 0);
	const out = new Uint8Array(totalLen);
	let offset = 0;
	for (const c of chunks) { out.set(c, offset); offset += c.length; }
	return new TextDecoder().decode(out);
}
function diffAgainstDefaults(current, defaults, _allowSparse) {
	const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
	const diff = {};
	for (const key of Object.keys(current)) {
		const keyInDefaults = defaults && (key in defaults);
		// viewportProfiles (and its per-bucket children) intentionally support optional keys -
		// headerScale, numberSize, inputFontSize, btnSize, inputAreaEnabled, inputAreaPct - that
		// never exist in DEFAULT_APP at all, since "absent" IS their default state (inherit the
		// matching global setting). The normal orphan-pruning guard below would otherwise treat
		// "not in defaults" the same as "orphaned old schema key" and silently drop every
		// per-bucket sizing override from every backup/export code. sparse marks that we're
		// inside that specific subtree, not a blanket bypass for arbitrary plain objects (which
		// could otherwise leak genuinely-orphaned removed settings back into new backups) - it
		// must apply to BOTH the recurse-into-object case below AND the plain-value case, since a
		// sparse key's value (e.g. headerScale: 150) is a primitive, not an object.
		const sparse = _allowSparse || key === 'viewportProfiles';
		if (isPlainObject(current[key]) && (keyInDefaults || sparse)) {
			const nested = diffAgainstDefaults(current[key], keyInDefaults ? defaults[key] : {}, sparse);
			if (Object.keys(nested).length > 0) diff[key] = nested;
			continue;
		}
		if (!keyInDefaults && !sparse) continue;
		const cv = current[key];
		const dv = keyInDefaults ? defaults[key] : undefined;
		if (Array.isArray(cv)) {
			if (JSON.stringify(cv) !== JSON.stringify(dv)) diff[key] = cv;
		} else if (cv !== dv) {
			diff[key] = cv;
		}
	}
	return diff;
}
function mergeWithDefaults(diff, defaults) {
	const isPlainObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
	const out = JSON.parse(JSON.stringify(defaults));
	for (const key of Object.keys(diff)) {
		const dv = diff[key];
		if (isPlainObject(dv) && isPlainObject(out[key])) {
			out[key] = mergeWithDefaults(dv, out[key]);
		} else {
			out[key] = dv;
		}
	}
	return out;
}
async function settingsToBackupCode() {
	const diff = diffAgainstDefaults(appSettings, DEFAULT_APP);
	const json = JSON.stringify(diff);
	const compressed = await gzipCompress(json);
	return compressed.length.toString(36) + '.' + bytesToBackupCode(compressed);
}
async function backupCodeToSettingsObject(code) {
	const clean = code.trim().replace(/\s+/g, '');
	const dotIndex = clean.indexOf('.');
	if (dotIndex === -1 || !/^[0-9a-z]+$/.test(clean.slice(0, dotIndex))) {
		if (/^[A-Za-z0-9_-]+$/.test(clean)) {
			let standard = clean.replace(/-/g, '+').replace(/_/g, '/');
			while (standard.length % 4 !== 0) standard += '=';
			const binary = atob(standard);
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
			return JSON.parse(new TextDecoder().decode(bytes));
		}
		throw new Error('Not a valid backup code');
	}
	const byteLength = parseInt(clean.slice(0, dotIndex), 36);
	const body = clean.slice(dotIndex + 1);
	if (!Number.isFinite(byteLength) || byteLength < 0) throw new Error('Not a valid backup code');
	const bytes = backupCodeToBytes(body, byteLength);
	const json = await gzipDecompress(bytes);
	return JSON.parse(json);
}
async function importSettingsFromBackupCode(code) {
	const imported = await backupCodeToSettingsObject(code);
	const merged = mergeWithDefaults(imported, DEFAULT_APP);
	Object.keys(appSettings).forEach(k => delete appSettings[k]);
	Object.assign(appSettings, merged);
	saveState();
	updateAllChrome();
	if (modules.settings) modules.settings.updateUIFromSettings();
	return true;
}
function loadState() {
	try {
		const s = localStorage.getItem(CONFIG.STORAGE_KEY_SETTINGS);
		const st = localStorage.getItem(CONFIG.STORAGE_KEY_STATE);
		if (s) {
			const loaded = JSON.parse(s);
			appSettings = {
				...DEFAULT_APP,
				...loaded,
				profiles: {
					...DEFAULT_APP.profiles,
					...loaded.profiles || ({})
				},
				customThemes: {
					...DEFAULT_APP.customThemes,
					...loaded.customThemes || ({})
				}
			};
			if (typeof appSettings.isHapticsEnabled === 'undefined') appSettings.isHapticsEnabled = true;
			// AP Shortcut, Quick Erase, Delete Gesture, and Clear Gesture are permanent features
			// now - their Settings toggles were removed, so force these true unconditionally
			// (not just when undefined) to correct anyone who had explicitly turned one off
			// before the toggle existed to remove.
			appSettings.isSpeedDeletingEnabled = true;
			appSettings.isLongPressAutoplayEnabled = true;
			appSettings.isDeleteTouchGestureEnabled = true;
			appSettings.isClearTouchGestureEnabled = true;
			if (typeof appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled === 'undefined') appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled = true;
			if (typeof appSettings.showTimer === 'undefined') appSettings.showTimer = false;
			if (typeof appSettings.showCounter === 'undefined') appSettings.showCounter = false;
			if (!appSettings.runtimeSettings.voicePresets) appSettings.runtimeSettings.voicePresets = {};
			if (!appSettings.runtimeSettings.activeVoicePresetId) appSettings.runtimeSettings.activeVoicePresetId = 'standard';
			if (!appSettings.touchResizeMode) appSettings.touchResizeMode = 'global';
			// split50 was split into split50v (portrait-held) and split50h (landscape-held) -
			// migrate any legacy single split50 profile into split50v so existing customizations
			// aren't silently lost (there's no way to know which physical orientation the old
			// settings were actually tuned for, so split50v was picked as the more common case;
			// split50h starts fresh at defaults).
			if (appSettings.viewportProfiles && appSettings.viewportProfiles.split50 && !appSettings.viewportProfiles.__split50Migrated) {
				const legacy = appSettings.viewportProfiles.split50;
				const target = appSettings.viewportProfiles.split50v || {};
				appSettings.viewportProfiles.split50v = Object.assign({}, target, {
					uiScale: legacy.uiScale, seqSize: legacy.seqSize, headerScale: legacy.headerScale,
					numberSize: legacy.numberSize, inputFontSize: legacy.inputFontSize, btnSize: legacy.btnSize,
					rowMax: legacy.rowMax, alignment: legacy.alignment,
					headerButtons: legacy.headerButtons
				});
				delete appSettings.viewportProfiles.split50;
				appSettings.viewportProfiles.__split50Migrated = true;
			}
			if (!appSettings.toneCalibration || typeof appSettings.toneCalibration !== 'object') appSettings.toneCalibration = { isCalibrated: false, notes: {} };
			if (!appSettings.toneCalibration.notes) appSettings.toneCalibration.notes = {};
			if (!appSettings.runtimeSettings) appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId]?.settings || DEFAULT_PROFILE_SETTINGS));
			if (appSettings.runtimeSettings.currentMode === 'unique_rounds') appSettings.runtimeSettings.currentMode = 'unique';
			const migratePause = v => (typeof v === 'string' ? 0 : v);
			appSettings.runtimeSettings.pauseSetting = migratePause(appSettings.runtimeSettings.pauseSetting);
			Object.values(appSettings.profiles || {}).forEach(p => {
					if (p && p.settings) p.settings.pauseSetting = migratePause(p.settings.pauseSetting);
			});
			// The split-screen buckets were originally (incorrectly) modeled as 75%/50%/25% of
			// the screen; real split-screen (Android and most OSes) only ever snaps to
			// 66%/50%/33%, so the buckets were renamed split75->split66 and split25->split33 to
			// match reality. Carry forward any customization saved under the old names rather
			// than letting the orphan-pruning below silently discard it.
			if (appSettings.viewportProfiles) {
				if (appSettings.viewportProfiles.split75 && !appSettings.viewportProfiles.split66) {
					appSettings.viewportProfiles.split66 = appSettings.viewportProfiles.split75;
				}
				if (appSettings.viewportProfiles.split25 && !appSettings.viewportProfiles.split33) {
					appSettings.viewportProfiles.split33 = appSettings.viewportProfiles.split25;
				}
				delete appSettings.viewportProfiles.split75;
				delete appSettings.viewportProfiles.split25;
				// split33's shipped default input-area width moved from 65% to 20% (65% left almost
				// no room for the sequence display in an already-narrow pane). Only nudge it forward
				// for someone still sitting on the old default - if they'd already dialed in their
				// own number, leave it alone.
				if (appSettings.viewportProfiles.split33 && appSettings.viewportProfiles.split33.inputAreaPct === 65) {
					appSettings.viewportProfiles.split33.inputAreaPct = 20;
				}
			}
			const pruneOrphaned = (obj, schema) => {
				if (!obj || !schema) return;
				Object.keys(obj).forEach(k => { if (!(k in schema)) delete obj[k]; });
			};
			pruneOrphaned(appSettings, DEFAULT_APP);
			pruneOrphaned(appSettings.runtimeSettings, DEFAULT_APP.runtimeSettings);
			Object.values(appSettings.profiles || {}).forEach(p => {
					if (p && p.settings) pruneOrphaned(p.settings, DEFAULT_PROFILE_SETTINGS);
			});
			// Input Font Size dropdown used to offer 12 arbitrary percentages (75-300); it now
			// matches Number Size's 4 semantic options (100/150/200/250) instead. A saved value
			// that isn't one of those four (e.g. 115, 275 from the old dropdown) would show the
			// select with nothing matched - snap it to the nearest of the new options instead of
			// leaving it stranded.
			if (typeof appSettings.appInputFontScale === 'number' && ![100, 150, 200, 250].includes(appSettings.appInputFontScale)) {
				const options = [100, 150, 200, 250];
				appSettings.appInputFontScale = options.reduce((nearest, opt) =>
					Math.abs(opt - appSettings.appInputFontScale) < Math.abs(nearest - appSettings.appInputFontScale) ? opt : nearest
				, options[0]);
			}
			// Backfill viewportProfiles: loadState() above does a SHALLOW spread ({...DEFAULT_APP,
			// ...loaded}), so a person whose saved data already has a viewportProfiles object (from
			// before a newer per-viewport setting like headerButtons/rowMax existed) keeps that
			// entire old object verbatim - new keys never get backfilled, silently reappearing as
			// "missing"/empty (e.g. an empty headerButtons array making every curated header button
			// vanish at 50%/33% even though the person never touched that setting). Fill in any
			// bucket or key absent from their saved profile with the current default, and leave
			// every key they've actually customized untouched.
			if (!appSettings.viewportProfiles || typeof appSettings.viewportProfiles !== 'object') {
				appSettings.viewportProfiles = JSON.parse(JSON.stringify(DEFAULT_APP.viewportProfiles));
			} else {
				Object.keys(DEFAULT_APP.viewportProfiles).forEach(bucket => {
					if (!appSettings.viewportProfiles[bucket] || typeof appSettings.viewportProfiles[bucket] !== 'object') {
						appSettings.viewportProfiles[bucket] = JSON.parse(JSON.stringify(DEFAULT_APP.viewportProfiles[bucket]));
						return;
					}
					Object.keys(DEFAULT_APP.viewportProfiles[bucket]).forEach(key => {
						if (!(key in appSettings.viewportProfiles[bucket])) {
							appSettings.viewportProfiles[bucket][key] = JSON.parse(JSON.stringify(DEFAULT_APP.viewportProfiles[bucket][key]));
							return;
						}
						// headerButtons specifically: an empty array is never a real user choice
						// (nobody wants zero header buttons available at 50%/33%) - it only happens
						// when the key existed under an older schema before this list was populated.
						// Treat it as unset and backfill, same as a missing key, for this field only.
						if (key === 'headerButtons' && Array.isArray(appSettings.viewportProfiles[bucket][key]) && appSettings.viewportProfiles[bucket][key].length === 0 && DEFAULT_APP.viewportProfiles[bucket][key].length > 0) {
							appSettings.viewportProfiles[bucket][key] = JSON.parse(JSON.stringify(DEFAULT_APP.viewportProfiles[bucket][key]));
						}
					});
				});
			}
		} else {
			appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles['profile_1'].settings));
		}
		if (st) appState = JSON.parse(st);
		if (!appState['current_session']) appState['current_session'] = {
			sequences: Array.from({
					length: CONFIG.MAX_MACHINES
				}, () => []),
			nextSequenceIndex: 0,
			currentRound: 1
		};
		appState['current_session'].currentRound = parseInt(appState['current_session'].currentRound) || 1;
	} catch (e) {
		console.error("Load failed", e);
		appSettings = JSON.parse(JSON.stringify(DEFAULT_APP));
		appState = {};
		saveState();
	}
}
function restoreDefaultSettings() {
	const fresh = JSON.parse(JSON.stringify(DEFAULT_APP));
	Object.keys(appSettings).forEach(k => delete appSettings[k]);
	Object.assign(appSettings, fresh);
	saveState();
	if (modules.settings) modules.settings.updateUIFromSettings();
	updateAllChrome();
	if (typeof showToast === 'function') showToast('Settings restored to defaults ↩️');
}
function hapticPulse(pattern) {
	if (appSettings.isDndEnabled) return;
	if (!navigator.vibrate) return;
	navigator.vibrate(pattern);
}
// Real, shared quality cap for every camera/mic stream in the app (AR camera, hand-tracking
// front/back cameras, pitch-detection mic). window.__ecoCameraQuality is set by
// applyEcoModeConfig() - 'full' outside eco mode or when this specific eco setting is off, so
// normal usage is completely unaffected.
function getEcoVideoConstraints(baseConstraints) {
	const quality = window.__ecoCameraQuality || 'full';
	const out = Object.assign({}, baseConstraints || {});
	if (quality === 'low') {
		out.width = { ideal: 320 };
		out.height = { ideal: 240 };
		out.frameRate = { ideal: 10, max: 15 };
	} else if (quality === 'medium') {
		out.width = { ideal: 480 };
		out.height = { ideal: 360 };
		out.frameRate = { ideal: 15, max: 24 };
	}
	return out;
}
function getEcoAudioConstraints(baseConstraints) {
	const quality = window.__ecoCameraQuality || 'full';
	const out = Object.assign({}, baseConstraints || {});
	if (quality === 'low') {
		out.sampleRate = 16000;
	} else if (quality === 'medium') {
		out.sampleRate = 24000;
	}
	return out;
}
window.getEcoVideoConstraints = getEcoVideoConstraints;
window.getEcoAudioConstraints = getEcoAudioConstraints;
function vibrate() {
	if (appSettings.isDndEnabled) return;
	if (!appSettings.isHapticsEnabled || !navigator.vibrate) return;
	const ecoActive = appSettings.isEcoModeEnabled && appSettings.ecoModeConfig;
	const level = ecoActive ? (appSettings.ecoModeConfig.hapticsLevel || 'normal') : 'normal';
	if (level === 'off') return;
	navigator.vibrate(level === 'light' ? 4 : 10);
}
function vibrateMorse(val) {
	if (appSettings.isDndEnabled) return;
	if (!navigator.vibrate || !appSettings.runtimeSettings.isHapticMorseEnabled) return;
	let num = parseInt(val);
	if (isNaN(num)) {
		const map = {
			'A': 6,
			'B': 7,
			'C': 8,
			'D': 9,
			'E': 10,
			'F': 11,
			'G': 12
		};
		num = map[val.toUpperCase()] || 1;
	}
	let patternStr = "";
	if (appSettings.morseMappings && appSettings.morseMappings[num]) {
		patternStr = appSettings.morseMappings[num];
	} else {
		if (num <= 3) patternStr = (".").repeat(num);
		else if (num <= 6) patternStr = "-" + (".").repeat(num - 3);
		else if (num <= 9) patternStr = "--" + (".").repeat(num - 6);
		else patternStr = "---" + (".").repeat(num - 10);
	}
	const speed = appSettings.runtimeSettings.playbackSpeed || 1.0;
	const factor = 1.0 / speed;
	const DOT = 100 * factor,
	DASH = 300 * factor,
	GAP = 100 * factor;
	let pattern = [];
	for (let char of patternStr) {
		if (char === '.') pattern.push(DOT);
		if (char === '-') pattern.push(DASH);
		pattern.push(GAP);
	}
	if (pattern.length > 0) navigator.vibrate(pattern);
}
function speak(text) {
	if (appSettings.isDndEnabled) return;
	if (!appSettings.runtimeSettings.isAudioEnabled || !window.speechSynthesis) return;
	window.speechSynthesis.cancel();
	const u = new SpeechSynthesisUtterance(text);
	u.lang = 'en-US';
	if (appSettings.runtimeSettings.selectedVoice) {
		const voices = window.speechSynthesis.getVoices();
		const v = voices.find(voice => voice.name === appSettings.runtimeSettings.selectedVoice);
		if (v) u.voice = v;
	}
	let p = appSettings.runtimeSettings.voicePitch || 1.0;
	let r = appSettings.runtimeSettings.voiceRate || 1.0;
	const ecoVoiceActive = appSettings.isEcoModeEnabled && appSettings.ecoModeConfig;
	const ecoVoiceMult = ecoVoiceActive ? Math.max(0.05, (appSettings.ecoModeConfig.volumePct || 100) / 100) : 1;
	u.volume = (appSettings.runtimeSettings.voiceVolume || 1.0) * ecoVoiceMult;
	u.pitch = Math.min(2, Math.max(0.1, p));
	u.rate = Math.min(10, Math.max(0.1, r));
	window.speechSynthesis.speak(u);
}
function _anyModalVisible() {
	return _MODAL_IDS.some(id => {
			const el = document.getElementById(id);
			return el && !el.classList.contains('opacity-0') && !el.classList.contains('pointer-events-none') && !el.classList.contains('hidden');
	});
}
function lockBodyScroll() {
	if (!_scrollLocked) {
		_savedScrollY = window.scrollY;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${_savedScrollY}px`;
		document.body.style.left = '0';
		document.body.style.right = '0';
		document.body.style.width = '100%';
		_scrollLocked = true;
	}
}
function unlockBodyScroll() {
	setTimeout(() => {
			if (_scrollLocked && !_anyModalVisible()) {
				document.body.style.position = '';
				document.body.style.top = '';
				document.body.style.left = '';
				document.body.style.right = '';
				document.body.style.width = '';
				window.scrollTo(0, _savedScrollY);
				_scrollLocked = false;
			}
		}, 50);
}
function showToast(msg) {
	if (appSettings.isDndEnabled) return;
	const t = document.getElementById('toast-notification');
	const m = document.getElementById('toast-message');
	if (!t || !m) return;
	m.textContent = msg;
	t.classList.remove('opacity-0', '-translate-y-10');
	setTimeout(() => t.classList.add('opacity-0', '-translate-y-10'), 2000);
}
function applyTheme(themeKey) {
	const body = document.body;
	body.className = body.className.replace(/theme-\w+/g, '');
	let t = appSettings.customThemes[themeKey];
	if (!t && PREMADE_THEMES[themeKey]) t = PREMADE_THEMES[themeKey];
	if (!t) t = PREMADE_THEMES['default'];
	body.style.setProperty('--primary', t.bubble);
	body.style.setProperty('--bg-main', t.bgMain);
	body.style.setProperty('--bg-modal', t.bgCard);
	body.style.setProperty('--card-bg', t.bgCard);
	body.style.setProperty('--seq-bubble', t.bubble);
	body.style.setProperty('--btn-bg', t.btn);
	body.style.setProperty('--bg-input', t.bgMain);
	body.style.setProperty('--text-main', t.text);
	const hex = t.bgCard.replace('#', '');
	const r = parseInt(hex.substring(0, 2), 16) || 0;
	const g = parseInt(hex.substring(2, 4), 16) || 0;
	const b = parseInt(hex.substring(4, 6), 16) || 0;
	const isDark = 0.299 * r + 0.587 * g + 0.114 * b < 128;
	body.style.setProperty('--border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
	const bHex = t.bubble.replace('#', '');
	const br = parseInt(bHex.substring(0, 2), 16) || 0;
	const bg = parseInt(bHex.substring(2, 4), 16) || 0;
	const bb = parseInt(bHex.substring(4, 6), 16) || 0;
	const bubbleIsDark = 0.299 * br + 0.587 * bg + 0.114 * bb < 128;
	body.style.setProperty('--seq-bubble-text', bubbleIsDark ? '#ffffff' : '#111827');
	body.classList.toggle('theme-is-light', !isDark);
	body.classList.toggle('theme-night', themeKey === 'night');
}
function applyAmbientThemeOverride(lux) {
	if (typeof lux !== 'number' || isNaN(lux)) return;
	if (lux <= AMBIENT_LIGHT_NIGHT_LUX && appSettings.isAutoDarkEnabled) {
		applyTheme('night');
	} else if (lux >= AMBIENT_LIGHT_SUNLIGHT_LUX && appSettings.isAutoBrightEnabled) {
		applyTheme('sunlight');
	} else {
		applyTheme(appSettings.activeTheme);
	}
}
window.updateAmbientSensorState = function(silent) {
	const needed = !!(appSettings.isAutoBrightEnabled || appSettings.isAutoDarkEnabled) && !window.__ecoAmbientOverride;
	if (needed && !ambientLightSensor) {
		if (!('AmbientLightSensor' in window)) {
			console.warn('Ambient Light Sensor not supported on this browser/device (requires the experimental Generic Sensor flag on most Android Chrome installs).');
			if (!silent && typeof showToast === 'function') showToast("Light sensor isn't available on this device ☀️");
			return;
		}
		try {
			ambientLightSensor = new AmbientLightSensor({ frequency: 1 });
			ambientLightSensor.addEventListener('reading', () => applyAmbientThemeOverride(ambientLightSensor.illuminance));
			ambientLightSensor.addEventListener('error', (e) => console.warn('Ambient Light Sensor error:', e.error?.name, e.error?.message));
			ambientLightSensor.start();
		} catch (e) {
			console.warn('Ambient Light Sensor failed to start:', e);
			ambientLightSensor = null;
		}
	} else if (!needed && ambientLightSensor) {
		try {
			ambientLightSensor.stop();
		} catch (e) {}
		ambientLightSensor = null;
		applyTheme(appSettings.activeTheme);
	}
};
window.updateProximitySensorState = function(silent) {
	const needed = !!appSettings.isAutoHideHeaderEnabled && !appSettings.isEcoModeEnabled;
	if (needed && !proximitySensor) {
		if (!('ProximitySensor' in window)) {
			console.warn('Proximity Sensor not supported on this browser/device (requires the experimental Generic Sensor flag on most Android Chrome installs).');
			if (!silent && typeof showToast === 'function') showToast("Proximity sensor isn't available on this device 🧭");
			return;
		}
		try {
			proximitySensor = new ProximitySensor({ frequency: 2 });
			proximitySensor.addEventListener('reading', () => {
				if (proximitySensor.near && typeof window.__unhideHeaderFromSensor === 'function') {
					window.__unhideHeaderFromSensor();
				}
			});
			proximitySensor.addEventListener('error', (e) => console.warn('Proximity Sensor error:', e.error?.name, e.error?.message));
			proximitySensor.start();
		} catch (e) {
			console.warn('Proximity Sensor failed to start:', e);
			proximitySensor = null;
		}
	} else if (!needed && proximitySensor) {
		try {
			proximitySensor.stop();
		} catch (e) {}
		proximitySensor = null;
	}
};
window.grantAllPermissions = async function() {
	if (typeof showToast === 'function') showToast('Checking permissions... 🔐');
	try {
		await navigator.clipboard.readText();
	} catch (e) {
		console.warn('Grant Permissions - clipboard:', e.name, e.message);
	}
	try {
		const micStream = await navigator.mediaDevices.getUserMedia({ audio: getEcoAudioConstraints({ echoCancellation: false, noiseSuppression: false, autoGainControl: false }) });
		await new Promise(r => setTimeout(r, 1000));
		micStream.getTracks().forEach(t => t.stop());
	} catch (e) {
		console.warn('Grant Permissions - microphone:', e.name, e.message);
	}
	try {
		const frontStream = await navigator.mediaDevices.getUserMedia({ video: getEcoVideoConstraints({ facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }) });
		await new Promise(r => setTimeout(r, 500));
		frontStream.getTracks().forEach(t => t.stop());
	} catch (e) {
		console.warn('Grant Permissions - front camera:', e.name, e.message);
	}
	try {
		const backStream = await navigator.mediaDevices.getUserMedia({ video: getEcoVideoConstraints({ facingMode: 'environment' }) });
		await new Promise(r => setTimeout(r, 500));
		backStream.getTracks().forEach(t => t.stop());
	} catch (e) {
		console.warn('Grant Permissions - back camera:', e.name, e.message);
	}
	if ('AmbientLightSensor' in window) {
		try {
			const s = new AmbientLightSensor();
			s.start();
			await new Promise(r => setTimeout(r, 300));
			s.stop();
		} catch (e) {
			console.warn('Grant Permissions - ambient light sensor:', e.name, e.message);
		}
	}
	if ('ProximitySensor' in window) {
		try {
			const s = new ProximitySensor();
			s.start();
			await new Promise(r => setTimeout(r, 300));
			s.stop();
		} catch (e) {
			console.warn('Grant Permissions - proximity sensor:', e.name, e.message);
		}
	}
	if (typeof showToast === 'function') showToast('Permission check complete ✅');
};
// Landscape and Split-Screen viewport detection: there's no official API for split-screen
// ratio, so this compares the app's actual width against the device's full screen width while
// in landscape orientation - a full-width app is "landscape", and progressively narrower panes
// bucket into the 75/50/25 split-screen presets. Portrait is untouched by any of this.
// Whether the CURRENT WINDOW is landscape-shaped or portrait-shaped right now - used both by
// detectViewportBucket() (below) and by applyViewportProfile() to decide, independent of which
// split-ratio bucket you're in, whether this is a sideways split (wide short window) or an
// upright split (narrow tall window, from holding the phone normally). The same bucket name
// (e.g. split50) can happen in either window shape, and the two need different layouts.
//
// window.screen.width/height are supposed to be the device's fixed physical dimensions, but
// they turned out not to be a reliable anchor at all on real Android WebViews - not just
// unreliable specifically during a split (an earlier fix tried caching a "confirmed" value the
// moment window.screen matched window.inner*, but if window.screen never reliably matches
// window.inner* on a given device even at genuine full screen, that confirmation moment simply
// never arrives, and detection is right back to trusting a live value that was never
// trustworthy to begin with - which is exactly why buckets kept collapsing toward one or two
// "attractor" sizes no matter what was actually on screen).
//
// This doesn't drop window.screen entirely - a single-signal "trust window.screen" approach was
// the original bug, and a single-signal "only trust observed history" approach turned out to
// have its own failure mode: it has nothing to go on until the app has genuinely been seen at
// full screen at least once, and if the very first observation this device ever records happens
// to be mid-split (a real possibility - testing this exact feature means spending most of your
// time IN split-screen, not out of it), that undersized reading gets locked in as the "device
// size" and every ratio computed against it is wrong in the OPPOSITE direction until a real
// full-screen moment happens to occur.
//
// Instead: track the largest window.innerWidth/innerHeight ever observed (persisted, same as
// before), AND on every read also compare that against the CURRENT LIVE window.screen reading,
// taking whichever of the two is larger for each axis. A device's true screen size can't
// actually shrink, so if either signal - the live one or the historical one - reports something
// bigger, that's real information the other one is currently missing, and the bigger number is
// closer to the truth than the smaller one. This means: the very first time the app is EVER
// full screen (virtually guaranteed to happen eventually, launch icon or otherwise), the true
// size gets locked in permanently via the observed-history side; but even before that happens,
// window.screen's live value - even if imperfect - still contributes whenever it's larger than
// whatever's been observed so far, instead of leaving detection stuck on a too-small bootstrap
// value with no better information to fall back on in the meantime.
const VP_EXTENTS_KEY = 'fm_device_extents';
function vpUpdateObservedExtents() {
	// Guard against page-zoom pollution: if the page is actively zoomed (native OS/browser zoom,
	// or any other mechanism outside the app's own CSS-based UI Scale, which never touches
	// window.innerWidth/innerHeight in the first place), window.innerWidth/innerHeight briefly
	// report a scaled, not-really-the-device-size value - e.g. a real observed case where BOTH
	// dimensions came back multiplied by the same ~1.54x factor relative to the device's actual
	// screen. Because this tracker takes a running MAXIMUM that can only ever grow, a single
	// zoomed reading like that gets permanently locked in and poisons every future detection,
	// even after the zoom ends - this is what actually caused "stuck on portrait no matter what."
	// window.visualViewport.scale reports exactly this: skip recording anything captured while
	// it's not ~1 (i.e., the page isn't currently zoomed), so a zoom event can't corrupt the
	// baseline in the first place, rather than trying to detect and undo it after the fact.
	if (window.visualViewport && typeof window.visualViewport.scale === 'number') {
		if (Math.abs(window.visualViewport.scale - 1) > 0.03) return;
	}
	const curShort = Math.min(window.innerWidth, window.innerHeight);
	const curLong = Math.max(window.innerWidth, window.innerHeight);
	if (!curShort || !curLong) return;
	let stored = null;
	try {
		const raw = localStorage.getItem(VP_EXTENTS_KEY);
		if (raw) stored = JSON.parse(raw);
	} catch (e) { /* corrupt/unavailable storage - treat as no prior observation */ }
	const nextShort = stored && stored.shortEdge ? Math.max(stored.shortEdge, curShort) : curShort;
	const nextLong = stored && stored.longEdge ? Math.max(stored.longEdge, curLong) : curLong;
	if (!stored || nextShort !== stored.shortEdge || nextLong !== stored.longEdge) {
		try {
			localStorage.setItem(VP_EXTENTS_KEY, JSON.stringify({ shortEdge: nextShort, longEdge: nextLong }));
		} catch (e) { /* storage unavailable - detection still works this session from the in-memory value below */ }
	}
}
function vpGetDeviceExtents() {
	let observed = null;
	try {
		const raw = localStorage.getItem(VP_EXTENTS_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (parsed && parsed.shortEdge && parsed.longEdge) observed = parsed;
		}
	} catch (e) { /* fall through */ }
	// Same zoom guard as vpUpdateObservedExtents() - if the page is currently zoomed, don't let
	// this moment's window.innerWidth/innerHeight feed into the live comparison either, even
	// transiently. Falls back to window.screen alone (or, failing that, whatever the persisted
	// observed value already is) rather than a reading that's known to be unreliable right now.
	const isZoomed = window.visualViewport && typeof window.visualViewport.scale === 'number' && Math.abs(window.visualViewport.scale - 1) > 0.03;
	const curShort = isZoomed ? 0 : Math.min(window.innerWidth, window.innerHeight);
	const curLong = isZoomed ? 0 : Math.max(window.innerWidth, window.innerHeight);
	let liveShort = curShort, liveLong = curLong;
	if (window.screen && window.screen.width && window.screen.height) {
		liveShort = Math.max(curShort, Math.min(window.screen.width, window.screen.height));
		liveLong = Math.max(curLong, Math.max(window.screen.width, window.screen.height));
	}
	if (!observed) return { shortEdge: liveShort, longEdge: liveLong };
	return {
		shortEdge: Math.max(observed.shortEdge, liveShort),
		longEdge: Math.max(observed.longEdge, liveLong)
	};
}
window.vpUpdateObservedExtents = vpUpdateObservedExtents;
window.vpGetDeviceExtents = vpGetDeviceExtents;
function isWindowLandscapeShaped() {
	if (window.__vpPreviewForceBucket) {
		// Preview mode always simulates a sideways split, matching how the configure modal's
		// live preview iframe is sized (see vpGetIframeTargetSize) - there's no portrait-shaped
		// preview mode built yet.
		return window.__vpPreviewForceBucket !== 'portrait';
	}
	vpUpdateObservedExtents();
	// The reliable signal is which of the window's own two dimensions is still "full": in a
	// sideways split, the window's height stays at ~100% of the device's short edge while its
	// width shrinks; in an upright split, it's the reverse. Comparing each axis against the
	// device's short edge (from observed extents, not window.screen) and taking whichever is
	// CLOSER to matching tells you which axis is unconstrained - the split is happening on the
	// other one.
	const extents = vpGetDeviceExtents();
	if (extents.shortEdge) {
		const widthDeficit = Math.abs(window.innerWidth - extents.shortEdge);
		const heightDeficit = Math.abs(window.innerHeight - extents.shortEdge);
		// If width is the one close to matching the short edge, width is unconstrained -> the
		// window is portrait-shaped (split is happening along height). If height is the closer
		// match, height is unconstrained -> the window is landscape-shaped (split is happening
		// along width).
		return heightDeficit < widthDeficit;
	}
	if (typeof window.orientation === 'number') {
		return Math.abs(window.orientation) === 90;
	}
	return window.innerWidth >= window.innerHeight;
}
window.isWindowLandscapeShaped = isWindowLandscapeShaped;
function detectViewportBucket() {
	// Viewport Preview mode (Landscape and Split Screen configure modal): the iframe is asked
	// to pretend to be a specific bucket regardless of the real device's screen/window ratio,
	// so the person can preview split50/split33 etc without physically resizing their window.
	if (window.__vpPreviewForceBucket) return window.__vpPreviewForceBucket;
	// If the page is CURRENTLY zoomed (mid-gesture or otherwise), window.innerWidth/innerHeight
	// themselves are momentarily unreliable as the ratio's numerator too, not just as a baseline
	// observation to persist (see vpUpdateObservedExtents/vpGetDeviceExtents) - keep reporting
	// whatever bucket was last genuinely detected instead of computing a fresh, skewed answer
	// from a transient state. This self-corrects the instant the zoom ends and a real resize/
	// layout event fires detection again.
	if (window.visualViewport && typeof window.visualViewport.scale === 'number' && Math.abs(window.visualViewport.scale - 1) > 0.03) {
		if (window.__vpLastDetectedBucket) return window.__vpLastDetectedBucket;
	}
	// Whether the CURRENT WINDOW is landscape-shaped or portrait-shaped - not the device's own
	// physical shape. A phone is always physically taller than wide, but split-screen while
	// holding it normally still produces a landscape-shaped pane if you're in a landscape app
	// and a portrait-shaped one if you're in a portrait app; the device's own shape was
	// previously used as a shortcut ("deviceIsLandscape"), which meant split-screen while
	// holding the phone normally (the actual common case) always short-circuited straight to
	// 'portrait' before ever checking the real window ratio - the split-screen buckets could
	// never be detected at all in that orientation, regardless of what ratio the split was
	// genuinely at.
	const windowIsLandscape = isWindowLandscapeShaped();
	vpUpdateObservedExtents();
	const extents = vpGetDeviceExtents();
	// The device's full screen dimension along whichever axis the current window is actually
	// splitting - i.e. if the window is landscape-shaped, compare its width against the
	// device's own long edge; if portrait-shaped, compare its height against the device's own
	// long edge (a portrait split-screen divides height, not width).
	const deviceLongEdge = extents.longEdge || Math.max(window.innerWidth, window.innerHeight);
	const ratio = windowIsLandscape
		? (deviceLongEdge > 0 ? window.innerWidth / deviceLongEdge : 1)
		: (deviceLongEdge > 0 ? window.innerHeight / deviceLongEdge : 1);
	let result;
	if (ratio >= 0.92) { result = windowIsLandscape ? 'landscape' : 'portrait'; window.__vpLastDetectedBucket = result; return result; }
	// Real split-screen only ever snaps to three ratios (~33%/50%/66%), never anywhere in
	// between, and once you're sitting at one of them it doesn't drift - a page reload while
	// genuinely split at 66% should still read as 66%, not silently reset to 50%. Reading the
	// ratio directly against these bands (instead of requiring a relative "crossing" from an
	// in-memory anchor that resets on every reload) gets that right. The bands are deliberately
	// wide - system UI overhead (nav bars, the divider itself, status bar insets) can push a
	// genuine 50/50 split's usable-area ratio well past the old narrow 0.5-centered midpoint,
	// which is what caused a real 50/50 split to misread as 66% in the first place.
	if (ratio >= 0.63) { result = 'split66'; window.__vpLastDetectedBucket = result; return result; }
	if (ratio >= 0.42) { result = windowIsLandscape ? 'split50h' : 'split50v'; window.__vpLastDetectedBucket = result; return result; }
	result = 'split33';
	window.__vpLastDetectedBucket = result;
	return result;
}
// Live diagnostic for the viewport/orientation detection above - shows exactly what THIS
// device is really reporting at every step, since synthetic tests can pass while genuine
// Android WebView behavior (which varies by manufacturer/browser) still differs from what's
// assumed. Rendered into the Help modal's Basics tab, toggled on demand rather than always-on.
function renderViewportDiagnostic() {
	const panel = document.getElementById('viewport-diag-panel');
	if (!panel) return;
	const screenW = window.screen ? window.screen.width : 'n/a';
	const screenH = window.screen ? window.screen.height : 'n/a';
	const innerW = window.innerWidth;
	const innerH = window.innerHeight;
	const extents = (typeof vpGetDeviceExtents === 'function') ? vpGetDeviceExtents() : null;
	const shortEdge = extents ? extents.shortEdge : 'n/a';
	const longEdge = extents ? extents.longEdge : 'n/a';
	const widthDeficit = (shortEdge !== 'n/a') ? Math.abs(innerW - shortEdge) : 'n/a';
	const heightDeficit = (shortEdge !== 'n/a') ? Math.abs(innerH - shortEdge) : 'n/a';
	const windowIsLandscape = isWindowLandscapeShaped();
	const bucket = detectViewportBucket();
	const mediaQueryLandscape = window.matchMedia('(orientation: landscape)').matches;
	const orientationApiType = (window.screen && window.screen.orientation) ? window.screen.orientation.type : 'n/a';
	const vvScale = (window.visualViewport && typeof window.visualViewport.scale === 'number') ? window.visualViewport.scale.toFixed(3) : 'n/a';
	const isZoomed = window.visualViewport && typeof window.visualViewport.scale === 'number' && Math.abs(window.visualViewport.scale - 1) > 0.03;
	const dpr = window.devicePixelRatio || 'n/a';
	const cssPxRatio = (typeof screenW === 'number' && screenW > 0) ? (innerW / screenW).toFixed(3) : 'n/a';
	panel.textContent =
		`app.js build: ${window.__fmBuildMarker || '(unknown - likely a very old cached version)'}\n` +
		`\n` +
		`window.visualViewport.scale: ${vvScale}  ${isZoomed ? '<-- PAGE IS CURRENTLY ZOOMED (detection frozen at last good value until this returns to ~1.0)' : '(not zoomed)'}\n` +
		`window.devicePixelRatio: ${dpr}\n` +
		`innerWidth / window.screen.width: ${cssPxRatio}  (if this isn't ~1.0 even while genuinely\n` +
		`full-screen and unzoomed, this browser/device reports CSS pixels at a different scale than\n` +
		`window.screen - harmless to detection as long as it's CONSISTENT, since every ratio below\n` +
		`is self-relative and cancels a constant scale factor out automatically)\n` +
		`\n` +
		`window.screen.width (LIVE, used only as a fallback signal):  ${screenW}\n` +
		`window.screen.height (LIVE, used only as a fallback signal): ${screenH}\n` +
		`observed short edge (learned baseline, used for detection): ${shortEdge}\n` +
		`observed long edge (learned baseline, used for detection):  ${longEdge}\n` +
		`window.innerWidth:    ${innerW}\n` +
		`window.innerHeight:   ${innerH}\n` +
		`\n` +
		`Detection is measured against the "observed" pair above - the largest window.innerWidth/\n` +
		`innerHeight this device has ever genuinely reported while NOT zoomed (persisted across\n` +
		`sessions), falling back to window.screen only until a real observation exists.\n` +
		`\n` +
		`short edge deficit: ${widthDeficit}\n` +
		`height deficit:     ${heightDeficit}\n` +
		`\n` +
		`isWindowLandscapeShaped(): ${windowIsLandscape}\n` +
		`detectViewportBucket():    ${bucket}\n` +
		`\n` +
		`(orientation:landscape) media query: ${mediaQueryLandscape}\n` +
		`screen.orientation.type:             ${orientationApiType}\n` +
		`data-viewport-bucket on <body>:      ${document.body.dataset.viewportBucket || '(unset)'}\n` +
		`data-portrait-split-layout:          ${document.body.dataset.portraitSplitLayout || '(unset)'}`;
}
window.renderViewportDiagnostic = renderViewportDiagnostic;
function getViewportProfile() {
	const bucket = document.body.dataset.viewportBucket;
	if (!bucket || bucket === 'portrait') return null;
	return (appSettings.viewportProfiles && appSettings.viewportProfiles[bucket]) || null;
}
function getEffectiveGlobalUiScale() {
	const vp = getViewportProfile();
	return vp ? vp.uiScale : (appSettings.globalUiScale || 100);
}
function getEffectiveSeqScaleMultiplier() {
	const vp = getViewportProfile();
	return vp ? vp.seqSize / 100 : (appSettings.uiScaleMultiplier || 1.0);
}
function getEffectiveHeaderScale() {
	const vp = getViewportProfile();
	return vp ? vp.headerScale : (appSettings.headerIconScale || 100);
}
function getEffectiveNumberSize() {
	const vp = getViewportProfile();
	return vp ? vp.numberSize : Math.round((appSettings.uiFontSizeMultiplier || 2.5) * 100);
}
function getEffectiveInputFontSize() {
	const vp = getViewportProfile();
	return vp ? vp.inputFontSize : (appSettings.appInputFontScale || 100);
}
function getEffectiveInputBtnSize() {
	const vp = getViewportProfile();
	return vp ? vp.btnSize : (appSettings.appInputBtnScale || 100);
}
function getEffectiveInputAreaEnabled() {
	const vp = getViewportProfile();
	// If the profile specifies an override, use it. Otherwise fall back to global.
	if (vp && vp.inputAreaEnabled !== undefined && vp.inputAreaEnabled !== null) return vp.inputAreaEnabled;
	return !!appSettings.isLandscapeInputResizeEnabled;
}
function getEffectiveInputAreaPct() {
	const vp = getViewportProfile();
	// 1. Check for a strict bucket profile override (e.g., split33's 65%)
	if (vp && vp.inputAreaPct !== undefined && vp.inputAreaPct !== null) return vp.inputAreaPct;
	
	// 2. If no strict override exists, intelligently fall back based on physical orientation
	const bucket = document.body.dataset.viewportBucket;
	const isStacked = bucket === 'portrait' || document.body.dataset.portraitSplitLayout === 'stacked';
	
	if (isStacked) {
		return appSettings.portraitInputHeightPct || 40;
	}
	return appSettings.landscapeInputWidthPct || 50;
}
// Header Padding / Inputs Padding: every non-portrait bucket carries its own copy in its
// profile (see DEFAULT_APP.viewportProfiles), same independence as every other per-bucket
// setting. Portrait has no profile (getViewportProfile() returns null for it), so it's the
// only one that ever falls through to the UI tab's own Header Padding/Inputs Padding value -
// which is therefore Portrait's setting specifically, not a shared global default.
function getEffectiveHeaderPadding() {
	const vp = getViewportProfile();
	return vp ? (vp.headerPadding || 0) : (appSettings.headerPadding || 0);
}
function getEffectiveInputsPadding() {
	const vp = getViewportProfile();
	return vp ? (vp.inputsPadding || 0) : (appSettings.inputsPadding || 0);
}
window.getEffectiveHeaderPadding = getEffectiveHeaderPadding;
window.getEffectiveInputsPadding = getEffectiveInputsPadding;
// PiP is fixed (not user-configurable) at these four bucket sizes: Machine 1's sequence goes in
// the popup, Machines 2-4 render in the regular sequence area. Landscape and Portrait are left
// alone - PiP there still shows whatever the (still-supported) pipMachineIndex setting says.
function isPipRestrictedBucket(bucket) {
	return bucket === 'split66' || bucket === 'split50v' || bucket === 'split50h' || bucket === 'split33';
}
window.isPipRestrictedBucket = isPipRestrictedBucket;
function syncPipSequenceOnlyMode() {
	const bucket = document.body.dataset.viewportBucket;
	const pipActive = !!document.pictureInPictureElement;
	// The body class no longer hides the sequence area outright (see the CSS comment at
	// .pip-sequence-only) - it's kept as a hook other code can key off of, and to trigger a
	// re-render so Machine 1 actually drops out of the main area the instant PiP opens/closes.
	document.body.classList.toggle('pip-sequence-only', isPipRestrictedBucket(bucket) && pipActive);
	if (typeof renderUI === 'function') renderUI();
}
// Maps the curated header-button ids used in the Landscape/Split Screen configure modal's
// checklist to their actual DOM element ids, so the person's per-viewport selection can
// actually gate visibility (previously the checklist wrote appSettings.viewportProfiles[bucket]
// .headerButtons but nothing read it - the 50%/33% curated set was hardcoded in CSS instead).
const VP_HEADER_BUTTON_ID_MAP = {
	timer: 'headertimerbtn', counter: 'headercounterbtn', play: 'headerplaybtn',
	delete: 'headerdeletebtn', bigger: 'headerbiggerbtn', swap: 'headerswapbtn',
	pip: 'headerpipbtn', touch: 'headertouchbtn'
};
function applyViewportHeaderButtonCuration(bucket) {
	const isCurated = bucket === 'split66' || bucket === 'split50v' || bucket === 'split50h' || bucket === 'split33';
	Object.keys(VP_HEADER_BUTTON_ID_MAP).forEach(curatedId => {
		const el = document.getElementById(VP_HEADER_BUTTON_ID_MAP[curatedId]);
		if (!el) return;
		el.classList.remove('vp-curated-hidden');
	});
	if (!isCurated) return;
	const profile = appSettings.viewportProfiles && appSettings.viewportProfiles[bucket];
	const selected = (profile && Array.isArray(profile.headerButtons)) ? profile.headerButtons : [];
	Object.keys(VP_HEADER_BUTTON_ID_MAP).forEach(curatedId => {
		if (selected.includes(curatedId)) return;
		const el = document.getElementById(VP_HEADER_BUTTON_ID_MAP[curatedId]);
		if (el) el.classList.add('vp-curated-hidden');
	});
}

function applyLandscapeInputWidth() {
	const bucket = document.body.dataset.viewportBucket;
	const isStacked = bucket === 'portrait' || document.body.dataset.portraitSplitLayout === 'stacked';
	const isLandscapeFamily = !isStacked && (bucket === 'landscape' || bucket === 'split66' || bucket === 'split50v' || bucket === 'split50h' || bucket === 'split33');
	
	// FIX: Both layout families now read from getEffectiveInputAreaEnabled()
	// This ensures split33's custom inputAreaEnabled flag correctly activates even in portrait/stacked
	const landscapeEnabled = isLandscapeFamily && getEffectiveInputAreaEnabled();
	const stackedHeightEnabled = isStacked && getEffectiveInputAreaEnabled();
	
	document.body.classList.toggle('landscape-resize-enabled', !!landscapeEnabled || !!stackedHeightEnabled);
	
	if (isLandscapeFamily) {
		if (!landscapeEnabled) {
			document.documentElement.style.removeProperty('--landscape-input-width');
		} else {
			const widthPct = Math.min(80, Math.max(20, getEffectiveInputAreaPct()));
			document.documentElement.style.setProperty('--landscape-input-width', widthPct + 'vw');
		}
	} else {
		document.documentElement.style.removeProperty('--landscape-input-width');
	}
	
	if (!stackedHeightEnabled) {
		document.documentElement.style.removeProperty('--portrait-input-height');
	} else {
		// FIX: Relies on the upgraded getter so stacked split33 uses 65% instead of falling back to 40%
		const heightPct = Math.min(80, Math.max(20, getEffectiveInputAreaPct()));
		document.documentElement.style.setProperty('--portrait-input-height', heightPct + 'vh');
	}
}
function applyViewportProfile() {
	const bucket = detectViewportBucket();
	const prevBucket = document.body.dataset.viewportBucket;
	document.body.dataset.viewportBucket = bucket;

	const profile = appSettings.viewportProfiles && appSettings.viewportProfiles[bucket];

	// 1. Dynamic splitAlignment processing (resolves split50v horizontal flex bug)
	if (profile && profile.alignment) {
		document.body.dataset.splitAlignment = profile.alignment;
	} else {
		delete document.body.dataset.splitAlignment;
	}

	if (bucket === 'split50v') {
		document.body.dataset.portraitSplitLayout = 'stacked';
	} else {
		const isSplitBucket = bucket === 'split66' || bucket === 'split33';
		if (isSplitBucket && !isWindowLandscapeShaped()) {
			if (bucket === 'split66') {
				document.body.dataset.portraitSplitLayout = 'stacked';
			} else {
				document.body.dataset.portraitSplitLayout = 'sideBySide';
			}
		} else {
			delete document.body.dataset.portraitSplitLayout;
		}
	}

	// 2. Curated header buttons and Custom Layout Triggers
	applyViewportHeaderButtonCuration(bucket);
	applyLandscapeInputWidth();
	syncPipSequenceOnlyMode();

	document.documentElement.style.fontSize = `${getEffectiveGlobalUiScale()}%`;
	renderUI();

	// 3. Dispatch specific metric applications - all six, not just Row Max/Button Size, or a
	// bucket's own Header Size / Input Font Size / Header Padding / Inputs Padding silently
	// wouldn't take effect until the person happened to reopen Settings for some unrelated reason.
	if (modules.settings && typeof modules.settings.applyRowMax === 'function') modules.settings.applyRowMax();
	if (modules.settings && typeof modules.settings.applyInputBtnScale === 'function') modules.settings.applyInputBtnScale();
	if (modules.settings && typeof modules.settings.applyHeaderScale === 'function') modules.settings.applyHeaderScale();
	if (modules.settings && typeof modules.settings.applyInputFontScale === 'function') modules.settings.applyInputFontScale();
	if (modules.settings && typeof modules.settings.applyHeaderPadding === 'function') modules.settings.applyHeaderPadding();
	if (modules.settings && typeof modules.settings.applyInputsPadding === 'function') modules.settings.applyInputsPadding();
}

function updateAllChrome() {
	applyTheme(appSettings.activeTheme);
	document.documentElement.style.fontSize = `${getEffectiveGlobalUiScale()}%`;
	document.body.style.fontFamily = appSettings.activeFontFamily || "'Inter', sans-serif";
	renderUI();
}
function startPracticeRound() {
	const settingsModal = document.getElementById('settings-modal');
	if (settingsModal && !settingsModal.classList.contains('pointer-events-none')) return;
	const state = getState();
	const settings = getProfileSettings();
	const max = settings.currentInput === 'key12' ? 12 : 9;
	const getRand = () => {
		if (settings.currentInput === 'piano') {
			const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', '1', '2', '3', '4', '5'];
			return keys[Math.floor(Math.random() * keys.length)];
		}
		return Math.floor(Math.random() * max) + 1;
	};
	if (practiceSequence.length === 0) state.currentRound = 1;
	if (settings.currentMode === CONFIG.MODES.SIMON) {
		practiceSequence.push(getRand());
		state.currentRound = practiceSequence.length;
	} else {
		practiceSequence = [];
		const len = state.currentRound;
		for (let i = 0; i < len; i++) practiceSequence.push(getRand());
	}
	practiceInputIndex = 0;
	renderUI();
	showToast(`Practice Round ${state.currentRound}`);
	setTimeout(() => playPracticeSequence(), 1000);
}
function playPracticeSequence() {
	if (appSettings.isToneCadenceEnabled && window.toneSequenceTester) {
		playPracticeSequenceViaTone();
		return;
	}
	let i = 0;
	const speed = appSettings.runtimeSettings.playbackSpeed || 1.0;
	disableInput(true);
	function next() {
		if (i >= practiceSequence.length) {
			disableInput(false);
			return;
		}
		const val = practiceSequence[i];
		const settings = getProfileSettings();
		const key = document.querySelector(`#pad-${settings.currentInput} button[data-value="${val}"]`);
		if (key && appSettings.runtimeSettings.isFlashEnabled) {
			key.classList.add('flash-active');
			setTimeout(() => key.classList.remove('flash-active'), 250 / speed);
		}
		speak(val);
		i++;
		setTimeout(next, 800 / speed);
	}
	next();
}
async function playPracticeSequenceViaTone() {
	disableInput(true);
	const tester = window.toneSequenceTester;
	if (practiceSequence.length === 1) {
		if (!appSettings.toneCalibration.isCalibrated) {
			await runToneCalibration();
		} else {
			await tester.playSequence([2, 3, 4, 5, 6, 7, 8, 9], 200, 800);
			await new Promise(r => setTimeout(r, 400));
		}
	}
	await tester.playSequence(practiceSequence, 200, 800);
	await new Promise(r => setTimeout(r, 400));
	await tester.playSequence(practiceSequence, 200, 800);
	disableInput(false);
	if (window.toneEngine && !window.toneEngine.isActive) window.toneEngine.start();
}
async function runToneCalibration() {
	const tester = window.toneSequenceTester;
	const engine = window.toneEngine;
	if (!tester || !engine) return;
	if (!engine.isActive) await engine.start();
	if (!engine.isActive) {
		await tester.playSequence([2, 3, 4, 5, 6, 7, 8, 9], 200, 800);
		await new Promise(r => setTimeout(r, 400));
		return;
	}
	if (engine.loopId) cancelAnimationFrame(engine.loopId);
	showToast('🎵 Calibrating Tone Cadence — hum each note back as you hear it');
	const sequence = [2, 3, 4, 5, 6, 7, 8, 9];
	const results = {};
	for (const n of sequence) {
		const target = TONE_TABLE.find(t => t.n === n);
		await tester.playTone(target.f, 200);
		await new Promise(r => setTimeout(r, 250));
		showToast(`🎵 Your turn: hum "${target.name}"`);
		const freq = await engine._listenForPitch(target.f, 1800);
		if (freq) {
			results[n] = freq;
			showToast(`✅ Got "${target.name}": ${Math.round(freq)}Hz`);
		} else {
			showToast(`⚠️ Didn't catch "${target.name}" — using the standard tone for it`);
		}
		await new Promise(r => setTimeout(r, 300));
	}
	appSettings.toneCalibration.notes = { ...appSettings.toneCalibration.notes, ...results };
	appSettings.toneCalibration.isCalibrated = true;
	saveState();
	showToast('🎵 Calibration complete ✅');
	engine.loop();
	if (window.__updateToneCalibrationStatus) window.__updateToneCalibrationStatus();
}
function addValue(value) {
	vibrate();
	const state = getState();
	const settings = getProfileSettings();
	if (appSettings.runtimeSettings.isPracticeModeEnabled) {
		if (practiceSequence.length === 0) return;
		if (value == practiceSequence[practiceInputIndex]) {
			practiceInputIndex++;
			if (practiceInputIndex >= practiceSequence.length) {
				speak("Correct");
				state.currentRound++;
				setTimeout(startPracticeRound, 1500);
			}
		} else {
			speak("Wrong");
			hapticPulse(500);
			setTimeout(() => playPracticeSequence(), 1500);
		}
		return;
	}
	let targetIndex = 0;
	if (settings.currentMode === CONFIG.MODES.SIMON) targetIndex = state.nextSequenceIndex % settings.machineCount;
	if (appSettings.isInputRegulatorEnabled && settings.currentMode === CONFIG.MODES.SIMON) {
		const now = Date.now();
		if (now - (lastMachineInputTime[targetIndex] || 0) < 2000) return;
	}
	const roundNum = parseInt(state.currentRound) || 1;
	const isUnique = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
	let limit;
	if (isUnique) {
		limit = appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled ? roundNum : settings.sequenceLength;
	} else {
		limit = settings.sequenceLength;
	}
	if (state.sequences[targetIndex] && state.sequences[targetIndex].length >= limit) {
		if (isUnique && appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled) {
			showToast("Round Full - Reset? 🛑");
			vibrate();
		}
		return;
	}
	let isFirstInput = true;
	state.sequences.forEach(s => {
			if (s.length > 0) isFirstInput = false;
	});
	if (isFirstInput) {
		if (appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.reset && globalTimerActions.start) {
			globalTimerActions.reset();
			globalTimerActions.start();
		}
		if (appSettings.isAutoCounterEnabled && appSettings.showCounter && globalCounterActions.increment) {
			globalCounterActions.increment();
		}
	}
	if (!state.sequences[targetIndex]) state.sequences[targetIndex] = [];
	state.sequences[targetIndex].push(value);
	state.nextSequenceIndex++;
	if (appSettings.isInputRegulatorEnabled && settings.currentMode === CONFIG.MODES.SIMON) lastMachineInputTime[targetIndex] = Date.now();
	renderUI();
	saveState();
	if (appSettings.runtimeSettings.isAutoplayEnabled) {
		if (settings.currentMode === CONFIG.MODES.SIMON) {
			const justFilled = (state.nextSequenceIndex - 1) % settings.machineCount;
			if (justFilled === settings.machineCount - 1) setTimeout(playDemo, 250);
		} else {
			if (appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled) {
				if (state.sequences[0].length >= roundNum) {
					disableInput(true);
					setTimeout(playDemo, 250);
				}
			} else {
				setTimeout(playDemo, 250);
			}
		}
	}
}
function resetCurrentMachine() {
	const state = getState();
	state.sequences = Array.from({ length: CONFIG.MAX_MACHINES }, () => []);
	state.nextSequenceIndex = 0;
	state.currentRound = 1;
	lastMachineInputTime = {};
	renderUI();
	saveState();
}
function snapshotForUndo() {
	try {
		const s = getState();
		appSettings.lastSequence = {
			sequences: JSON.parse(JSON.stringify(s.sequences)),
			nextSequenceIndex: s.nextSequenceIndex,
			currentRound: s.currentRound
		};
	} catch (e) {
		console.warn('[Undo] snapshot failed:', e);
	}
}
function performUndo() {
	if (!appSettings.lastSequence) {
		if (typeof showToast === 'function') showToast("Nothing to undo");
		return;
	}
	try {
		const s = getState();
		s.sequences = JSON.parse(JSON.stringify(appSettings.lastSequence.sequences));
		s.nextSequenceIndex = appSettings.lastSequence.nextSequenceIndex;
		s.currentRound = appSettings.lastSequence.currentRound;
		appSettings.lastSequence = null;
		renderUI();
		saveState();
		if (typeof showToast === 'function') showToast("Undone ↩️");
	} catch (e) {
		console.warn('[Undo] restore failed:', e);
	}
}
function handleBackspace(e) {
	if (e) {
		e.preventDefault();
		e.stopPropagation();
	}
	vibrate();
	const state = getState();
	const settings = getProfileSettings();
	if (state.nextSequenceIndex <= 0) return;
	if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
		if (state.sequences[0].length > 0) {
			state.sequences[0].pop();
			state.nextSequenceIndex--;
		}
	} else {
		let target = (state.nextSequenceIndex - 1) % settings.machineCount;
		if (target < 0) target = settings.machineCount - 1;
		if (state.sequences[target] && state.sequences[target].length > 0) {
			state.sequences[target].pop();
			state.nextSequenceIndex--;
		}
	}
	let isEmpty = true;
	state.sequences.forEach(s => {
			if (s.length > 0) isEmpty = false;
	});
	if (isEmpty && appSettings.isAutoTimerEnabled && appSettings.showTimer && globalTimerActions.stop) {
		globalTimerActions.stop();
	}
	renderUI();
	saveState();
}
function getRedeemImageTransform(scalePercent) {
	// Physical rotation is handled by the outer box's CSS (scoped to orientation and lock
	// state), so the image itself only ever needs the zoom scale, not its own rotation.
	return `scale(${scalePercent / 100})`;
}
function applyPositionSwapOffsets(isActive) {
	const footer = document.getElementById('input-footer');
	const app = document.getElementById('app');
	const header = document.getElementById('aux-control-header');
	if (!footer || !app) return;
	// A narrow split-screen pane can end up taller than it is wide, which flips the CSS
	// orientation media query to "portrait" even though the device itself is physically in
	// landscape/split-screen - checking the already-detected viewport bucket alongside the
	// live media query keeps split-screen panes on the landscape-style layout path instead of
	// falling back to portrait's "move footer to top with measured padding" math, which breaks
	// badly against a footer that's much taller than the sliver of height actually available.
	const viewportBucket = document.body.dataset.viewportBucket;
	const isSplitBucket = viewportBucket === 'landscape' || viewportBucket === 'split66' || viewportBucket === 'split50v' || viewportBucket === 'split50h' || viewportBucket === 'split33';
	const isLandscape = window.matchMedia('(orientation: landscape)').matches || isSplitBucket;
	const inputMode = document.body.dataset.inputMode;
	const sideRepositioned = isLandscape && (inputMode === 'key9' || inputMode === 'key12');
	if (sideRepositioned) {
		// Landscape key9/key12: left/right positioning is handled entirely by CSS via
		// the layout-swapped class - clear any leftover portrait inline styles so they
		// don't conflict with it.
		footer.style.top = '';
		footer.style.bottom = '';
		app.style.paddingTop = '';
		app.style.paddingBottom = '';
		app.style.paddingLeft = '';
		app.style.paddingRight = '';
		if (window.modules && window.modules.settings) window.modules.settings.updateSequenceContainerOffset();
		return;
	}
	if (isLandscape) {
		// Landscape, non-key9/12 (piano, gesture pad): these footers can be much taller than
		// the portrait "move to top with measured padding" math assumes, which was pushing
		// #app's padding-top past 500px and squeezing everything else into a sliver. In
		// landscape, swap for these modes is handled by CSS alone (border flip via
		// layout-swapped) rather than inline top/padding measurements - clear any leftover
		// inline values so they can't conflict with it.
		footer.style.top = '';
		footer.style.bottom = '';
		app.style.paddingTop = '';
		app.style.paddingBottom = '';
		if (window.modules && window.modules.settings) window.modules.settings.updateSequenceContainerOffset();
		return;
	}
	if (isActive) {
		const headerVisible = header && !header.classList.contains('header-hidden');
		const headerH = headerVisible ? header.offsetHeight : 0;
		footer.style.top = headerH + 'px';
		footer.style.bottom = 'auto';
		app.style.paddingTop = footer.offsetHeight + headerH + 16 + 'px';
		app.style.paddingBottom = '2rem';
	} else {
		footer.style.top = '';
		footer.style.bottom = '';
		app.style.paddingTop = '';
		app.style.paddingBottom = '';
	}
	if (window.modules && window.modules.settings) window.modules.settings.updateSequenceContainerOffset();
}
function renderUI() {
	const container = document.getElementById('sequence-container');
	if (!container) return;
	if (window.modules && window.modules.settings) window.modules.settings.updateSequenceContainerOffset();
	try {
		const gpWrap = document.getElementById('gesture-pad-wrapper');
		const pad = document.getElementById('gesture-pad');
		if (gpWrap) {
			const isGlobalTouchGestureOn = appSettings.isTouchGestureInputEnabled;
			const isBossTouchGestureOn = appSettings.isBossModeEnabled && appSettings.isTouchGestureInputEnabled && bossState.isActive;
			if (isGlobalTouchGestureOn && isTouchGesturePadVisible || isBossTouchGestureOn) {
				document.body.classList.add('input-gestures-mode');
				gpWrap.classList.remove('hidden');
				if (isBossTouchGestureOn) {
					gpWrap.style.zIndex = '10001';
					if (pad) {
						pad.style.opacity = '0.05';
						pad.style.borderColor = 'transparent';
					}
				} else {
					gpWrap.style.zIndex = '';
					if (pad) {
						pad.style.opacity = '1';
						pad.style.borderColor = '';
					}
				}
			} else {
				document.body.classList.remove('input-gestures-mode');
				gpWrap.classList.add('hidden');
				gpWrap.style.zIndex = '';
			}
		}
	} catch (e) {
		console.error('Gesture UI error', e);
	}
	container.innerHTML = '';
	const settings = getProfileSettings();
	const state = getState();
	document.body.dataset.inputMode = settings.currentInput;
	['key9', 'key12', 'piano'].forEach(k => {
			const el = document.getElementById(`pad-${k}`);
			if (el) el.style.display = settings.currentInput === k ? 'block' : 'none';
	});
	if (document.body.classList.contains('layout-swapped')) {
		setTimeout(() => applyPositionSwapOffsets(true), 0);
	}
	if (appSettings.runtimeSettings.isPracticeModeEnabled) {
		const header = document.createElement('h2');
		header.className = "text-2xl font-bold text-center w-full mt-4 mb-4";
		header.style.color = "var(--text-main)";
		header.innerHTML = `Practice Mode (${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon' : 'Unique'})<br><span class=\"text-sm opacity-70\">Round ${state.currentRound}</span>`;
		container.appendChild(header);
		if (practiceSequence.length === 0) {
			state.currentRound = 1;
			const btn = document.createElement('button');
			btn.textContent = "START";
			btn.className = "w-48 h-48 rounded-full bg-green-600 hover:bg-green-500 text-white text-3xl font-bold practice-start-glow transition-all transform hover:scale-105 active:scale-95 animate-pulse mx-auto block";
			btn.onclick = () => {
				btn.style.display = 'none';
				startPracticeRound();
			};
			container.appendChild(btn);
		} else {
			const controlsDiv = document.createElement('div');
			controlsDiv.className = "flex flex-col items-center gap-3 w-full";
			const replayBtn = document.createElement('button');
			replayBtn.innerHTML = "↻ REPLAY ROUND";
			replayBtn.className = "w-64 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg text-xl active:scale-95 transition-transform";
			replayBtn.onclick = () => {
				practiceInputIndex = 0;
				showToast("Replaying... 👂");
				playPracticeSequence();
			};
			const resetLvlBtn = document.createElement('button');
			resetLvlBtn.innerHTML = "⚠️ Reset to Level 1";
			resetLvlBtn.className = "text-xs text-red-400 hover:text-red-300 underline py-2";
			resetLvlBtn.onclick = () => {
				if (confirm("Restart practice from Level 1?")) {
					practiceSequence = [];
					state.currentRound = 1;
					renderUI();
				}
			};
			controlsDiv.appendChild(replayBtn);
			controlsDiv.appendChild(resetLvlBtn);
			container.appendChild(controlsDiv);
		}
		return;
	}
	// PiP fixed-machine mode (33%/50h/50v/66%, popup open): Machine 1 lives exclusively in the
	// PiP popup (see drawPipFrame) - the main sequence area shows Machines 2-4 instead of hiding
	// outright, so multi-machine games stay fully visible and playable around the popup.
	const pipRestricted = isPipRestrictedBucket(document.body.dataset.viewportBucket) && !!document.pictureInPictureElement;
	let activeSeqs, activeIndices;
	if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
		activeSeqs = [state.sequences[0]];
		activeIndices = [0];
	} else {
		activeIndices = Array.from({ length: settings.machineCount }, (_, i) => i);
		if (pipRestricted) activeIndices = activeIndices.filter(i => i !== 0);
		activeSeqs = activeIndices.map(i => state.sequences[i]);
	}
	if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
		const roundNum = parseInt(state.currentRound) || 1;
		const header = document.createElement('h2');
		header.className = "text-xl font-bold text-center w-full mb-4 opacity-80";
		header.style.color = "var(--text-main)";
		header.innerHTML = `Unique Mode: <span class=\"text-primary-app\">Round ${roundNum}</span>`;
		container.appendChild(header);
	}
	// Narrow side-by-side panes (33%/50h) get at most 2 machine columns instead of up to 4 - a
	// rigid 4-across grid squeezed into an already-narrow pane is what made multi-machine games
	// there effectively unusable regardless of how much the touch-gesture pad freed up.
	const bucketForGrid = document.body.dataset.viewportBucket;
	const narrowBucket = bucketForGrid === 'split33' || bucketForGrid === 'split50h';
	const maxCols = narrowBucket ? 2 : 4;
	let gridCols = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS ? 1 : Math.max(1, Math.min(activeSeqs.length, maxCols));
	container.className = `flex-grow grid gap-4 w-full max-w-5xl mx-auto grid-cols-${gridCols}`;
	container.style.gridAutoRows = '1fr';
	container.style.minHeight = '0';
	activeSeqs.forEach((seq, arrIdx) => {
			const idx = activeIndices[arrIdx];
			const card = document.createElement('div');
			card.className = "p-4 rounded-xl shadow-md transition-all duration-200 min-h-[100px] bg-[var(--card-bg)] relative group";
			if (settings.machineCount > 1) {
				const headerRow = document.createElement('div');
				headerRow.className = "flex justify-between items-center mb-2 pb-2 border-b border-custom border-opacity-20";
				const title = document.createElement('span');
				title.className = "text-[10px] font-bold uppercase text-muted-custom tracking-wider";
				title.textContent = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS ? "SEQUENCE" : `MACHINE ${idx + 1}`;
				const controls = document.createElement('div');
				controls.className = "flex space-x-3 opacity-60 hover:opacity-100 transition-opacity";
				const btnBack = document.createElement('button');
				btnBack.innerHTML = "⌫";
				btnBack.className = "hover:text-red-400 text-sm font-bold";
				btnBack.onclick = e => {
					e.stopPropagation();
					if (state.sequences[idx] && state.sequences[idx].length > 0) {
						state.sequences[idx].pop();
						if (state.nextSequenceIndex > 0) state.nextSequenceIndex--;
						vibrate();
						renderUI();
						saveState();
					}
				};
				if (settings.currentMode !== CONFIG.MODES.UNIQUE_ROUNDS) {
					const btnTrash = document.createElement('button');
					btnTrash.innerHTML = "🗑️";
					btnTrash.className = "hover:text-red-600 text-sm";
					btnTrash.title = "Remove Machine";
					btnTrash.onclick = e => {
						e.stopPropagation();
						if (confirm(`Remove Machine ${idx + 1} entirely?`)) {
							const countToRemove = state.sequences[idx].length;
							state.sequences.splice(idx, 1);
							settings.machineCount--;
							const sel = document.getElementById('machines-select');
							if (sel) sel.value = settings.machineCount;
							state.nextSequenceIndex = Math.max(0, state.nextSequenceIndex - countToRemove);
							vibrate();
							showToast(`Removed Machine ${idx + 1}`);
							renderUI();
							saveState();
						}
					};
					controls.appendChild(btnTrash);
				}
				controls.insertBefore(btnBack, controls.firstChild);
				headerRow.appendChild(title);
				headerRow.appendChild(controls);
				card.appendChild(headerRow);
			}
			const numGrid = document.createElement('div');
			// Both single- and multi-machine sequences use the same flex-wrap layout, so Row
			// Max / UI Scale / Sequence Size (including the per-viewport-bucket overrides from
			// the Landscape/Split Screen configure modal) actually apply to what's on screen.
			// This used to hard-code a 4-column CSS grid whenever more than one machine was
			// active, which ignored all of those settings outright - the grid packed exactly 4
			// per row no matter what Row Max said, and no matter how large the boxes were sized
			// to be, so real gameplay with 2+ machines never matched what the settings preview
			// (which only ever previews a single machine) showed.
			numGrid.className = "flex flex-wrap gap-2 justify-center";
			(seq || []).forEach(num => {
					const span = document.createElement('span');
					span.className = "number-box rounded-lg shadow-sm flex items-center justify-center font-bold";
					const scale = getEffectiveSeqScaleMultiplier();
					const boxSize = 40 * scale;
					span.style.width = boxSize + 'px';
					span.style.height = boxSize + 'px';
					const fontMult = (typeof getEffectiveNumberSize === 'function' ? getEffectiveNumberSize() : (appSettings.uiFontSizeMultiplier || 1.0) * 100) / 100;
					const fontSizePx = boxSize * 0.5 * fontMult;
					span.style.fontSize = fontSizePx + 'px';
					span.textContent = num;
					numGrid.appendChild(span);
			});
			card.appendChild(numGrid);
			container.appendChild(card);
	});
	// Fix: flex-wrap on numGrid wraps based on its own logical (pre-rotation) axis, which
	// while Portrait Lock is compensating doesn't match the visual space the card actually
	// renders at after rotation - a rotated element's logical width becomes its visual
	// height, and vice versa. For row-direction flex-wrap (the default), wrapping is
	// governed by logical width, but widening that axis actually shrinks the visual width
	// (the opposite of what's needed). Flipping to column-direction and sizing the logical
	// height axis instead means each logical "column" (which becomes a visual row after
	// rotation) holds enough boxes to span the available visual width.
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const isRotating = document.body.dataset.rotate === '90' || document.body.dataset.rotate === '270';
			Array.from(container.children).forEach(card => {
				const numGrid = card.querySelector('.flex.flex-wrap');
				if (!numGrid) return;
				if (!isRotating) { numGrid.style.height = ''; numGrid.style.flexDirection = ''; return; }
				const cardCs = getComputedStyle(card);
				const vPad = parseFloat(cardCs.paddingTop) + parseFloat(cardCs.paddingBottom);
				const available = card.clientHeight - vPad;
				if (available > 0) {
					numGrid.style.flexDirection = 'column';
					numGrid.style.height = available + 'px';
				}
			});
		});
	});
	const hMic = document.getElementById('headervoicebtn');
	const hCam = document.getElementById('headerarcambtn');
	const hGest = document.getElementById('headertouchbtn');
	if (hMic) {
		const isVoiceActive = voiceModule && voiceModule.isListening;
		hMic.classList.toggle('header-btn-active', isVoiceActive);
	}
	if (hCam) hCam.classList.toggle('header-btn-active', document.body.classList.contains('ar-active'));
	if (hGest) hGest.classList.toggle('header-btn-active', isTouchGesturePadVisible);
	document.querySelectorAll('.reset-button').forEach(b => {
			const showReset = settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS;
			b.style.display = showReset ? 'block' : 'none';
			b.closest('.control-row')?.classList.toggle('reset-visible', showReset);
	});
	if (modules.settings && typeof modules.settings.applyRowMax === 'function') modules.settings.applyRowMax();
	// Stacked buckets (Portrait, split50v, and split66 when stacked) can leave #app genuinely
	// short on room once Adjust Input Area eats most of the height - #app scrolls internally
	// rather than clipping content outright (see the max-height rule in styles.css), but a fresh
	// scrollTop of 0 shows the OLDEST entries first and cuts off wherever space runs out, not
	// necessarily the most recently played numbers. Auto-scrolling #app to the bottom means
	// whatever's visible is always the latest activity - the part that actually matters mid-game -
	// with the rest still reachable by scrolling up. No-op wherever #app isn't scrollable (most
	// buckets, most of the time), so this changes nothing outside that specific tight scenario.
	const appEl = document.getElementById('app');
	if (appEl && appEl.scrollHeight > appEl.clientHeight) {
		appEl.scrollTop = appEl.scrollHeight;
	}
}
function disableInput(disabled) {
	const footer = document.getElementById('input-footer');
	if (!footer) return;
	if (disabled) {
		footer.classList.add('opacity-50', 'pointer-events-none');
	} else {
		footer.classList.remove('opacity-50', 'pointer-events-none');
	}
}
function playDemo() {
	if (isDemoPlaying) return;
	isDemoPlaying = true;
	isPlaybackPaused = false;
	playbackResumeCallback = null;
	const settings = getProfileSettings();
	const state = getState();
	const speed = appSettings.runtimeSettings.playbackSpeed || 1.0;
	const playBtn = document.querySelector('button[data-action="play-demo"]');
	let seqsToPlay = [];
	if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS) {
		seqsToPlay = [state.sequences[0]];
	} else {
		seqsToPlay = state.sequences.slice(0, settings.machineCount);
	}
	const chunkSize = settings.simonChunkSize || 3;
	let chunks = [];
	let maxLen = 0;
	seqsToPlay.forEach(s => {
			if (s.length > maxLen) maxLen = s.length;
	});
	let roundIdx = 0;
	for (let i = 0; i < maxLen; i += chunkSize) {
		for (let m = 0; m < seqsToPlay.length; m++) {
			const seq = seqsToPlay[m];
			if (i < seq.length) {
				const slice = seq.slice(i, i + chunkSize);
				chunks.push({
						machine: m,
						nums: slice,
						isNewRound: m === 0 && i === 0 && chunks.length === 0,
						roundIdx: roundIdx
				});
			}
		}
		roundIdx++;
	}
	let cIdx = 0;
	let totalCount = 0;
	const schedule = (fn, delay) => {
		setTimeout(() => {
				if (!isDemoPlaying) return;
				if (isPlaybackPaused) {
					playbackResumeCallback = fn;
				} else {
					fn();
				}
			}, delay);
	};
	function nextChunk() {
		if (!isDemoPlaying) {
			if (playBtn) playBtn.textContent = "▶";
			return;
		}
		if (cIdx >= chunks.length) {
			isDemoPlaying = false;
			if (playBtn) playBtn.textContent = "▶";
			if (settings.currentMode === CONFIG.MODES.UNIQUE_ROUNDS && appSettings.runtimeSettings.isUniqueRoundsAutoClearEnabled) {
				setTimeout(() => {
						if (!isDemoPlaying) {
							state.currentRound++;
							state.sequences[0] = [];
							state.nextSequenceIndex = 0;
							lastMachineInputTime = {};
							renderUI();
							showToast(`Round ${state.currentRound}`);
							saveState();
							disableInput(false);
						}
					}, 500);
			}
			return;
		}
		const chunk = chunks[cIdx];
		const roundDelay = settings.simonInterSequenceDelay || 0;
		const pauseDelay = settings.pauseSetting || 0;
		let nIdx = 0;
		function playNum() {
			if (!isDemoPlaying) {
				if (playBtn) playBtn.textContent = "▶";
				return;
			}
			if (nIdx >= chunk.nums.length) {
				cIdx++;
				const next = chunks[cIdx];
				const isSameRoundNextMachine = next && next.roundIdx === chunk.roundIdx;
				schedule(nextChunk, isSameRoundNextMachine ? pauseDelay : roundDelay);
				return;
			}
			const val = chunk.nums[nIdx];
			totalCount++;
			if (playBtn) playBtn.textContent = totalCount;
			const kVal = val;
			const padId = `pad-${settings.currentInput}`;
			const btn = document.querySelector(`#${padId} button[data-value="${kVal}"]`);
			if (btn && appSettings.runtimeSettings.isFlashEnabled) {
				btn.classList.add('flash-active');
				setTimeout(() => btn.classList.remove('flash-active'), 250 / speed);
			}
			speak(val);
			if (appSettings.runtimeSettings.isHapticMorseEnabled) vibrateMorse(val);
			nIdx++;
			schedule(playNum, CONFIG.DEMO_DELAY_BASE_MS / speed);
		}
		playNum();
	}
	nextChunk();
}
function setupARLogic() {
	const headerCam = document.getElementById('headerarcambtn');
	const inputFooter = document.getElementById('input-footer');
	const arRecordBtn = document.getElementById('ar-record-btn');
	const arBackgroundVideo = document.getElementById('ar-background-video');
	const arPlaybackContainer = document.getElementById('ar-playback-container');
	const arPlaybackVideo = document.getElementById('ar-playback-video');
	let mediaRecorder, recordedChunks = [];
	async function syncARState(isTargetActive) {
		document.body.classList.toggle('ar-active', isTargetActive);
		if (headerCam) headerCam.classList.toggle('header-btn-active', isTargetActive);
		if (inputFooter) {
			if (isTargetActive) inputFooter.classList.add('hidden');
			else inputFooter.classList.remove('hidden');
		}
		if (arRecordBtn) {
			if (isTargetActive) {
				arRecordBtn.classList.remove('hidden');
				arRecordBtn.classList.add('flex');
			} else {
				arRecordBtn.classList.add('hidden');
				arRecordBtn.classList.remove('flex');
			}
		}
		if (isTargetActive) {
			document.body.style.backgroundColor = "transparent";
			document.getElementById('ar-container')?.classList.remove('hidden');
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				console.error("AR Camera: navigator.mediaDevices.getUserMedia is unavailable - this page needs to be served over HTTPS (or http://localhost) for camera access to work.");
				showToast("Camera needs HTTPS 🔒 (or localhost)");
				return;
			}
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
						video: getEcoVideoConstraints({ facingMode: "environment" })
				});
				if (arBackgroundVideo) {
					arBackgroundVideo.srcObject = stream;
					arBackgroundVideo.play().catch(e => console.warn(e));
				}
			} catch (err) {
				console.error("AR Camera runtime initialization error:", err.name, err.message);
				if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
					showToast("Camera Access Denied ❌ (check browser site settings)");
				} else if (err.name === 'NotFoundError') {
					showToast("No Camera Found 📷❌");
				} else if (err.name === 'NotReadableError') {
					showToast("Camera In Use By Another App ❌");
				} else {
					showToast(`Camera Error: ${err.name || 'Unknown'} ❌`);
				}
			}
		} else {
			document.body.style.backgroundColor = "";
			document.getElementById('ar-container')?.classList.add('hidden');
			if (arBackgroundVideo && arBackgroundVideo.srcObject) {
				arBackgroundVideo.srcObject.getTracks().forEach(track => track.stop());
				arBackgroundVideo.srcObject = null;
			}
		}
	}
	if (headerCam) {
		headerCam.onclick = () => {
			const currentToggleState = !document.body.classList.contains('ar-active');
			syncARState(currentToggleState);
			showToast(currentToggleState ? "AR Mode: Ready to Record 📸" : "AR Mode OFF");
		};
	}
	if (arRecordBtn) {
		arRecordBtn.addEventListener('pointerdown', e => {
				e.preventDefault();
				recordedChunks = [];
				const stream = arBackgroundVideo?.srcObject;
				if (!stream) return showToast("Camera stream not ready 🛑");
				try {
					mediaRecorder = new MediaRecorder(stream, {
							mimeType: 'video/webm'
					});
				} catch (err) {
					mediaRecorder = new MediaRecorder(stream);
				}
				mediaRecorder.ondataavailable = ev => {
					if (ev.data.size > 0) recordedChunks.push(ev.data);
				};
				mediaRecorder.onstop = () => {
					const blob = new Blob(recordedChunks, {
							type: 'video/webm'
					});
					if (arPlaybackVideo && arPlaybackContainer) {
						arPlaybackVideo.src = URL.createObjectURL(blob);
						arPlaybackContainer.classList.remove('hidden');
						arPlaybackContainer.style.display = 'flex';
						arPlaybackVideo.playbackRate = appSettings.arPlaybackSpeed || 1.0;
						arPlaybackVideo.play().catch(err => console.warn(err));
					}
				};
				mediaRecorder.start();
				arRecordBtn.classList.add('bg-red-800', 'scale-90');
				showToast("Recording Video... 🔴");
		});
		arRecordBtn.addEventListener('pointerup', e => {
				e.preventDefault();
				if (mediaRecorder && mediaRecorder.state !== 'inactive') {
					mediaRecorder.stop();
				}
				arRecordBtn.classList.remove('bg-red-800', 'scale-90');
		});
	}
	const arPlaybackClose = document.getElementById('ar-close-playback-btn');
	const closeArPlayback = () => {
		if (arPlaybackVideo) {
			arPlaybackVideo.pause();
			arPlaybackVideo.src = "";
		}
		if (arPlaybackContainer) {
			arPlaybackContainer.classList.add('hidden');
			arPlaybackContainer.style.display = 'none';
		}
	};
	if (arPlaybackClose) {
		arPlaybackClose.addEventListener('click', closeArPlayback);
	}
	if (arPlaybackVideo) {
		arPlaybackVideo.addEventListener('ended', () => {
				if (appSettings.isArAutoCloseEnabled) closeArPlayback();
		});
		let wasPlayingBeforeTouch = false;
		arPlaybackVideo.addEventListener('pointerdown', () => {
				wasPlayingBeforeTouch = !arPlaybackVideo.paused;
				if (wasPlayingBeforeTouch) arPlaybackVideo.pause();
		});
		const resumeIfNeeded = () => {
			if (wasPlayingBeforeTouch) {
				arPlaybackVideo.play().catch(() => {});
				wasPlayingBeforeTouch = false;
			}
		};
		arPlaybackVideo.addEventListener('pointerup', resumeIfNeeded);
		arPlaybackVideo.addEventListener('pointercancel', resumeIfNeeded);
		arPlaybackVideo.addEventListener('pointerleave', resumeIfNeeded);
	}
}
function mapTouchGestureToValue(kind, currentInput) {
	const saved = appSettings.touchGestureMappings || ({});
	const windingShapeBases = ['corner', 'triangle', 'u_shape', 'square', 'switchback', 'motion_tap_corner'];
	const directions = ['up', 'down', 'left', 'right', 'nw', 'ne', 'sw', 'se'];
	const matches = (target, incoming) => {
		if (!target) return false;
		if (target === incoming) return true;
		for (const base of windingShapeBases) {
			if (!target.startsWith(base + '_')) continue;
			const rest = target.slice(base.length + 1);
			let wantWinding = null;
			if (rest === 'any') wantWinding = null;
			else if (rest === 'any_cw' || rest === 'cw') wantWinding = 'cw';
			else if (rest === 'any_ccw' || rest === 'ccw') wantWinding = 'ccw';
			else continue;
			for (const dir of directions) {
				const windingsToCheck = wantWinding ? [wantWinding] : ['cw', 'ccw'];
				for (const w of windingsToCheck) {
					if (incoming === base + '_' + dir + '_' + w) return true;
				}
			}
		}
		if (target.endsWith('_any')) {
			const base = target.replace('_any', '');
			if (incoming === base) return true;
			const suffixTokens = ['up', 'down', 'left', 'right', 'nw', 'ne', 'sw', 'se', 'vertical', 'horizontal', 'diagonal_se', 'diagonal_sw'];
			if (suffixTokens.some(s => incoming === base + '_' + s)) return true;
		}
		return false;
	};
	const checkMatch = key => {
		const m = saved[key] || ({});
		const touchG = m.gesture || DEFAULT_MAPPINGS[key];
		return matches(touchG, kind);
	};
	if (currentInput === CONFIG.INPUTS.PIANO) {
		const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', '1', '2', '3', '4', '5'];
		for (let k of keys) {
			if (checkMatch('piano_' + k)) return k;
		}
	} else if (currentInput === CONFIG.INPUTS.KEY12) {
		for (let i = 1; i <= 12; i++) {
			if (checkMatch('k12_' + i)) return i;
		}
	} else if (currentInput === CONFIG.INPUTS.KEY9) {
		for (let i = 1; i <= 9; i++) {
			if (checkMatch('k9_' + i)) return i;
		}
	}
	return null;
}
function updateEngineConstraints() {
	if (!modules.touchGestureEngine) return;
	const settings = getProfileSettings();
	const saved = appSettings.touchGestureMappings || ({});
	const getG = key => saved[key] && saved[key].gesture ? saved[key].gesture : DEFAULT_MAPPINGS[key];
	const activeList = [];
	if (settings.currentInput === CONFIG.INPUTS.PIANO) {
		['C', 'D', 'E', 'F', 'G', 'A', 'B', '1', '2', '3', '4', '5'].forEach(k => activeList.push(getG('piano_' + k)));
	} else if (settings.currentInput === CONFIG.INPUTS.KEY12) {
		for (let i = 1; i <= 12; i++) activeList.push(getG('k12_' + i));
	} else if (settings.currentInput === CONFIG.INPUTS.KEY9) {
		for (let i = 1; i <= 9; i++) activeList.push(getG('k9_' + i));
	}
	if (appSettings.isDeleteTouchGestureEnabled) activeList.push('delete');
	if (appSettings.isClearTouchGestureEnabled) activeList.push('clear');
	modules.touchGestureEngine.updateAllowed(activeList);
}
function initTouchGestureEngine() {
	const engine = new TouchGestureEngine(document.body, {
			tapDelay: appSettings.touchGestureTapDelay || 300,
			swipeThreshold: appSettings.touchGestureSwipeDist || 30,
			longPressTime: appSettings.touchGestureLongPressTime || 300,
			tapPrecision: appSettings.touchGestureTapPrecision || 30,
			spatialThreshold: appSettings.touchGestureSpatialThreshold || 10,
			longSwipeThreshold: appSettings.touchGestureLongSwipeThreshold || 150,
			multiSwipeThreshold: appSettings.touchGestureMultiSwipeThreshold || 10,
			debug: false
		}, {
			onTouchGesture: data => {
				const isPadOpen = typeof isTouchGesturePadVisible !== 'undefined' && isTouchGesturePadVisible;
				const isClassPresent = document.body.classList.contains('input-gestures-mode');
				const isBossActive = appSettings.isBossModeEnabled && appSettings.isTouchGestureInputEnabled && bossState.isActive;
				if (isPadOpen || isClassPresent || isBossActive) {
					const settings = getProfileSettings();
					const mapResult = mapTouchGestureToValue(data.name, settings.currentInput);
					const indicator = document.getElementById('gesture-indicator');
					if (mapResult !== null) {
						addValue(mapResult);
						if (indicator) {
							indicator.textContent = data.name.replace(/_/g, ' ').toUpperCase();
							indicator.style.opacity = '1';
							indicator.style.color = 'var(--seq-bubble)';
							setTimeout(() => {
									indicator.style.opacity = '0.3';
									indicator.style.color = '';
								}, 250);
						}
					} else {
						if (indicator) {
							indicator.textContent = data.name.replace(/_/g, ' ');
							indicator.style.opacity = '0.5';
							setTimeout(() => indicator.style.opacity = '0.3', 500);
						}
					}
				}
			},
			onContinuous: data => {
				console.log("Continuous Gesture:", data.type, "Fingers:", data.fingers);
				if (data.type === 'squiggle' && data.fingers === 1) {
					if (appSettings.isDeleteTouchGestureEnabled) {
						const now = Date.now();
						if (now - lastSquiggleDeleteSnapshotTime > 400) snapshotForUndo();
						lastSquiggleDeleteSnapshotTime = now;
						handleBackspace();
						showToast("Deleted ⌫");
						vibrate();
					}
					return;
				}
				if (data.type === 'squiggle' && data.fingers === 2) {
					if (appSettings.isClearTouchGestureEnabled) {
						snapshotForUndo();
						const s = getState();
						s.sequences = Array.from({
								length: CONFIG.MAX_MACHINES
							}, () => []);
						s.nextSequenceIndex = 0;
						renderUI();
						saveState();
						showToast("CLEARED 💥");
						vibrate();
					}
					return;
				}
				if (data.type === 'twist' && data.fingers === 3 && appSettings.isVolumeTouchGesturesEnabled) {
					let newVol = appSettings.runtimeSettings.voiceVolume || 1.0;
					newVol += data.value * 0.05;
					appSettings.runtimeSettings.voiceVolume = Math.min(1.0, Math.max(0.0, newVol));
					saveState();
					showToast(`Volume: ${(appSettings.runtimeSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
				}
				if (data.type === 'twist' && data.fingers === 2 && appSettings.isSpeedTouchGesturesEnabled) {
					let newSpeed = appSettings.runtimeSettings.playbackSpeed || 1.0;
					newSpeed += data.value * 0.05;
					appSettings.runtimeSettings.playbackSpeed = Math.min(2.0, Math.max(0.5, newSpeed));
					saveState();
					showToast(`Speed: ${(appSettings.runtimeSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
				}
				if (data.type === 'pinch') {
					const mode = appSettings.touchResizeMode || 'none';
					if (mode === 'none') return;
					if (!touchGestureState.isPinching) {
						touchGestureState.isPinching = true;
						touchGestureState.startGlobal = appSettings.globalUiScale;
						touchGestureState.startSeq = appSettings.uiScaleMultiplier;
					}
					clearTimeout(touchGestureState.resetTimer);
					touchGestureState.resetTimer = setTimeout(() => {
							touchGestureState.isPinching = false;
						}, 250);
					if (mode === 'sequence') {
						let raw = touchGestureState.startSeq * data.scale;
						let newScale = Math.round(raw * 10) / 10;
						if (newScale !== appSettings.uiScaleMultiplier) {
							appSettings.uiScaleMultiplier = Math.min(3.0, Math.max(0.5, newScale));
							renderUI();
							showToast(`Cards: ${(appSettings.uiScaleMultiplier * 100).toFixed(0)}% 🔍`);
						}
					} else {
						let raw = touchGestureState.startGlobal * data.scale;
						let newScale = Math.round(raw / 10) * 10;
						if (newScale !== appSettings.globalUiScale) {
							appSettings.globalUiScale = Math.min(200, Math.max(50, newScale));
							updateAllChrome();
							showToast(`UI: ${appSettings.globalUiScale}% 🔍`);
						}
					}
				}
			}
	});
	modules.touchGestureEngine = engine;
	updateEngineConstraints();
	const originalRender = renderUI;
	renderUI = function() {
		originalRender();
		updateEngineConstraints();
	};
}
function initHeaderGestures() {
    const headerRow = document.getElementById('header-btn-row');
    const headerWrapper = document.getElementById('aux-control-header');
    if (!headerRow || !headerWrapper) return;

    let gestureState = {
        activeBtn: null,
        timer: null,
        selected: false,
        startX: 0,
        startY: 0,
        pointers: new Map(),
        twoFingerTimer: null,
        restoreActive: false,
        restoreStartY: 0
    };

    headerWrapper.addEventListener('pointerdown', e => {
        gestureState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // Check for 2-finger Restore Gesture
        if (appSettings.isRestoreHeaderGestureEnabled && gestureState.pointers.size === 2) {
            const pts = Array.from(gestureState.pointers.values());
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            
            if (dist > 80) { // Spaced out check
                gestureState.restoreActive = false;
                gestureState.restoreStartY = (pts[0].y + pts[1].y) / 2;
                
                gestureState.twoFingerTimer = setTimeout(() => {
                    gestureState.restoreActive = true;
                    headerWrapper.style.transition = 'background 0.3s ease';
                    headerWrapper.style.backgroundColor = 'rgba(99, 102, 241, 0.15)'; // Magic glow cue
                    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
                }, 400);
            }
        }

        // Check for 1-finger Flick Gesture
        if (appSettings.isFlickHeaderEnabled && gestureState.pointers.size === 1) {
            const btn = e.target.closest('button');
            if (btn && btn.parentElement === headerRow) {
                gestureState.activeBtn = btn;
                gestureState.startX = e.clientX;
                gestureState.startY = e.clientY;
                gestureState.selected = false;
                
                gestureState.timer = setTimeout(() => {
                    gestureState.selected = true;
                    btn.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    btn.style.transform = 'scale(1.15) translateY(-5px)';
                    btn.style.zIndex = '100';
                    btn.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.8)';
                    if (navigator.vibrate) navigator.vibrate(50);
                }, 400); // Long press duration
            }
        }
    });

    headerWrapper.addEventListener('pointermove', e => {
        if (!gestureState.pointers.has(e.pointerId)) return;
        gestureState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

        // Handle 2-finger Restore Drag
        if (gestureState.restoreActive && gestureState.pointers.size === 2) {
            const pts = Array.from(gestureState.pointers.values());
            const currentY = (pts[0].y + pts[1].y) / 2;
            
            if (currentY - gestureState.restoreStartY > 70) { // Slowly dragged down
                const hiddenBtns = document.querySelectorAll('#header-btn-row button.flicked-away');
                hiddenBtns.forEach((b, index) => {
                    setTimeout(() => {
                        b.classList.remove('flicked-away');
                        b.style.display = '';
                        b.style.transform = '';
                        b.style.opacity = '1';
                    }, index * 50); // Staggered reappearance
                });
                
                gestureState.restoreActive = false;
                headerWrapper.style.backgroundColor = '';
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                if (typeof showToast === 'function') showToast('Buttons Restored 🪄');
            }
        }

        // Cancel Flick selection if moving too early
        if (gestureState.pointers.size === 1 && gestureState.activeBtn && !gestureState.selected) {
            if (Math.hypot(e.clientX - gestureState.startX, e.clientY - gestureState.startY) > 15) {
                clearTimeout(gestureState.timer);
                gestureState.activeBtn = null;
            }
        }
    });

    const handlePointerUp = e => {
        // Execute Flick
        if (gestureState.pointers.size === 1 && gestureState.activeBtn && gestureState.selected) {
            const dx = e.clientX - gestureState.startX;
            const dy = e.clientY - gestureState.startY;
            
            // Check if distance qualifies as a flick towards the edge
            if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
                const btn = gestureState.activeBtn;
                btn.style.transition = 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)';
                btn.style.transform = `translate(${dx * 2.5}px, ${dy * 2.5}px) scale(0.4) rotate(${dx}deg)`;
                btn.style.opacity = '0';
                
                setTimeout(() => {
                    btn.classList.add('flicked-away');
                    btn.style.display = 'none'; // Unmounted purely visually 
                    btn.style.transform = ''; 
                    btn.style.boxShadow = '';
                    btn.style.zIndex = '';
                }, 350);
                
                if (navigator.vibrate) navigator.vibrate(20);
            } else {
                // Cancel if dropped without flicking
                gestureState.activeBtn.style.transform = '';
                gestureState.activeBtn.style.boxShadow = '';
                gestureState.activeBtn.style.zIndex = '';
            }
        } else if (gestureState.activeBtn && !gestureState.selected) {
            clearTimeout(gestureState.timer);
        }

        // Reset tracking states
        gestureState.pointers.delete(e.pointerId);
        if (gestureState.pointers.size === 0) {
            clearTimeout(gestureState.twoFingerTimer);
            gestureState.restoreActive = false;
            headerWrapper.style.backgroundColor = '';
            
            if (gestureState.activeBtn && !gestureState.activeBtn.classList.contains('flicked-away')) {
                gestureState.activeBtn.style.transform = '';
                gestureState.activeBtn.style.boxShadow = '';
                gestureState.activeBtn.style.zIndex = '';
            }
            gestureState.activeBtn = null;
        }
    };

    headerWrapper.addEventListener('pointerup', handlePointerUp);
    headerWrapper.addEventListener('pointercancel', handlePointerUp);
    headerRow.addEventListener('contextmenu', e => {
        if (gestureState.selected || gestureState.restoreActive) e.preventDefault(); 
    });
}

function initGlobalListeners() {
	try {
        initHeaderGestures();
		(() => {
				const header = document.getElementById('aux-control-header');
				const btnRow = document.getElementById('header-btn-row');
				if (!header) return;
				let hideTimer = null;
				let unhideGraceTimer = null;
				window.__clearAutoHideHeaderTimer = () => { clearTimeout(hideTimer); hideTimer = null; };
				const unhideHeaderNow = () => {
					if (!appSettings.isAutoHideHeaderEnabled) return;
					const wasInactive = header.classList.contains('auto-hide-inactive');
					header.classList.remove('auto-hide-inactive');
					clearTimeout(hideTimer);
					hideTimer = setTimeout(() => { header.classList.add('auto-hide-inactive'); }, 5000);
					if (wasInactive && btnRow) {
						clearTimeout(unhideGraceTimer);
						btnRow.classList.add('header-just-unhidden');
						unhideGraceTimer = setTimeout(() => {
								btnRow.classList.remove('header-just-unhidden');
							}, 400);
					}
				};
				header.addEventListener('pointerdown', unhideHeaderNow);
				window.__unhideHeaderFromSensor = unhideHeaderNow;
		})();
		document.querySelectorAll('.btn-pad-number').forEach(b => {
				const press = dedupeTouchMouseHandler(e => {
					if (e) {
						e.preventDefault();
						e.stopPropagation();
					}
					if (ignoreNextClick) return;
					addValue(b.dataset.value);
					b.classList.add('flash-active');
					setTimeout(() => b.classList.remove('flash-active'), 150);
				});
				b.addEventListener('mousedown', press);
				b.addEventListener('touchstart', press, {
						passive: false
				});
		});
		document.querySelectorAll('button[data-action="play-demo"]').forEach(b => {
				let wasPlaying = false;
				let lpTriggered = false;
				const handleDown = dedupeTouchMouseHandler(e => {
					if (e && e.cancelable) {
						e.preventDefault();
						e.stopPropagation();
					}
					wasPlaying = isDemoPlaying;
					lpTriggered = false;
					if (wasPlaying) {
						isDemoPlaying = false;
						b.textContent = "▶";
						showToast("Playback Stopped 🛑");
						return;
					}
					if (appSettings.isLongPressAutoplayEnabled) {
						timers.longPress = setTimeout(() => {
								lpTriggered = true;
								appSettings.runtimeSettings.isAutoplayEnabled = !appSettings.runtimeSettings.isAutoplayEnabled;
								modules.settings.updateUIFromSettings();
								showToast(`Autoplay: ${appSettings.runtimeSettings.isAutoplayEnabled ? "ON" : "OFF"}`);
								ignoreNextClick = true;
								setTimeout(() => ignoreNextClick = false, 500);
							}, 800);
					}
				});
				const handleUp = dedupeTouchMouseHandler(e => {
					if (e && e.cancelable) {
						e.preventDefault();
						e.stopPropagation();
					}
					clearTimeout(timers.longPress);
					if (!wasPlaying && !lpTriggered) {
						playDemo();
					}
				});
				b.addEventListener('mousedown', handleDown);
				b.addEventListener('touchstart', handleDown, {
						passive: false
				});
				b.addEventListener('mouseup', handleUp);
				b.addEventListener('touchend', handleUp);
				b.addEventListener('mouseleave', () => clearTimeout(timers.longPress));
		});
		document.querySelectorAll('button[data-action="reset-unique-rounds"]').forEach(b => {
				b.addEventListener('click', () => {
						if (confirm("Reset Round Counter to 1?")) {
							snapshotForUndo();
							const s = getState();
							s.currentRound = 1;
							s.sequences[0] = [];
							s.nextSequenceIndex = 0;
							lastMachineInputTime = {};
							renderUI();
							saveState();
							showToast("Reset to Round 1");
						}
				});
		});
		document.querySelectorAll('button[data-action="open-settings"]').forEach(b => {
				b.addEventListener('click', () => {
						if (isDemoPlaying) {
							isDemoPlaying = false;
							const pb = document.querySelector('button[data-action="play-demo"]');
							if (pb) pb.textContent = "▶";
							showToast("Playback Stopped 🛑");
							return;
						}
						modules.settings.openSettings();
				});
		});
		const startDelete = dedupeTouchMouseHandler(e => {
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}
			snapshotForUndo();
			handleBackspace(null);
			if (!appSettings.isSpeedDeletingEnabled) return;
			timers.initialDelay = setTimeout(() => {
					timers.speedDelete = setInterval(() => handleBackspace(null), CONFIG.SPEED_DELETE_INTERVAL);
				}, CONFIG.SPEED_DELETE_DELAY);
		});
		const stopDelete = () => {
			clearTimeout(timers.initialDelay);
			clearInterval(timers.speedDelete);
		};
		document.querySelectorAll('button[data-action="backspace"]').forEach(b => {
				b.addEventListener('mousedown', startDelete);
				b.addEventListener('touchstart', startDelete, {
						passive: false
				});
				b.addEventListener('mouseup', stopDelete);
				b.addEventListener('mouseleave', stopDelete);
				b.addEventListener('touchend', stopDelete);
				b.addEventListener('touchcancel', stopDelete);
		});
		const headerDeleteBtnEl = document.getElementById('headerdeletebtn');
		if (headerDeleteBtnEl) {
			headerDeleteBtnEl.addEventListener('mousedown', startDelete);
			headerDeleteBtnEl.addEventListener('touchstart', startDelete, {
					passive: false
			});
			headerDeleteBtnEl.addEventListener('mouseup', stopDelete);
			headerDeleteBtnEl.addEventListener('mouseleave', stopDelete);
			headerDeleteBtnEl.addEventListener('touchend', stopDelete);
			headerDeleteBtnEl.addEventListener('touchcancel', stopDelete);
		}
		const headerUndoBtnEl = document.getElementById('headerundobtn');
		if (headerUndoBtnEl) {
			headerUndoBtnEl.onclick = () => performUndo();
		}
		if (appSettings.showWelcomeScreen && modules.settings && !location.search.includes('vpPreview=1')) setTimeout(() => modules.settings.openSetup(), 500);
		const handlePause = e => {
			if (isDemoPlaying) {
				isPlaybackPaused = true;
				showToast("Paused ⏸️");
			}
		};
		const handleResume = e => {
			if (isPlaybackPaused) {
				isPlaybackPaused = false;
				showToast("Resumed ▶️");
				if (playbackResumeCallback) {
					const fn = playbackResumeCallback;
					playbackResumeCallback = null;
					fn();
				}
			}
		};
		document.body.addEventListener('mousedown', handlePause);
		document.body.addEventListener('touchstart', handlePause, {
				passive: true
		});
		document.body.addEventListener('mouseup', handleResume);
		document.body.addEventListener('touchend', handleResume);
		document.getElementById('close-settings').addEventListener('click', () => {
				if (appSettings.runtimeSettings.isPracticeModeEnabled) {
					setTimeout(startPracticeRound, 500);
				}
		});
		let lastX = 0,
		lastY = 0,
		lastZ = 0;
		window.addEventListener('devicemotion', e => {
				if (!appSettings.isBossModeEnabled) return;
				const acc = e.accelerationIncludingGravity;
				if (!acc) return;
				const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
				if (delta > 25) {
					const now = Date.now();
					if (now - bossState.lastShake > 1000) {
						bossState.isActive = !bossState.isActive;
						document.body.classList.toggle('boss-active', bossState.isActive);
						showToast(bossState.isActive ? "Boss Mode 🌑" : "Welcome Back");
						vibrate();
						renderUI();
						bossState.lastShake = now;
					}
				}
				lastX = acc.x;
				lastY = acc.y;
				lastZ = acc.z;
		});
		const bl = document.getElementById('boss-layer');
		if (bl) {
			bl.addEventListener('touchstart', e => {
					if (appSettings.isTouchGestureInputEnabled) return;
					if (e.touches.length === 1) {
						e.preventDefault();
						const t = e.touches[0];
						const w = window.innerWidth;
						const h = window.innerHeight;
						let col = Math.floor(t.clientX / (w / 3));
						if (col > 2) col = 2;
						const settings = getProfileSettings();
						let val = null;
						if (settings.currentInput === 'key9') {
							let row = Math.floor(t.clientY / (h / 3));
							if (row > 2) row = 2;
							val = row * 3 + col + 1;
						} else {
							let row = Math.floor(t.clientY / (h / 4));
							if (row > 3) row = 3;
							const index = row * 3 + col;
							if (settings.currentInput === 'piano') {
								const map = ['1', '2', '3', '4', '5', 'C', 'D', 'E', 'F', 'G', 'A', 'B'];
								val = map[index];
							} else {
								val = index + 1;
							}
						}
						if (val !== null) {
							addValue(val.toString());
							hapticPulse(20);
						}
					}
				}, {
					passive: false
			});
		}
		const headerTimer = document.getElementById('headertimerbtn');
		const headerCounter = document.getElementById('headercounterbtn');
		const headerMic = document.getElementById('headervoicebtn');
		const headerCam = document.getElementById('headerarcambtn');
		const headerTouchGesture = document.getElementById('headertouchbtn');
		const headerHand = document.getElementById('headerhandbtn');
		if (headerHand) {
			headerHand.onclick = () => {
				if (!modules.vision) return;
				const isActive = !modules.vision.isActive;
				if (isActive) {
					modules.vision.start();
					headerHand.classList.add('header-btn-active');
				} else {
					modules.vision.stop();
					headerHand.classList.remove('header-btn-active');
				}
			};
		}
		const headerBigger = document.getElementById('headerbiggerbtn');
		if (headerBigger) {
			headerBigger.onclick = () => {
				document.body.classList.toggle('hide-controls');
				const isActive = document.body.classList.contains('hide-controls');
				headerBigger.classList.toggle('header-btn-active', isActive);
				showToast(isActive ? "Bigger Buttons Active" : "Controls Visible");
				setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
			};
		}
		const headerSwap = document.getElementById('headerswapbtn');
		if (headerSwap) {
			headerSwap.onclick = () => {
				const isActive = !document.body.classList.contains('layout-swapped');
				document.body.classList.toggle('layout-swapped', isActive);
				headerSwap.classList.toggle('header-btn-active', isActive);
				applyPositionSwapOffsets(isActive);
				showToast(isActive ? "Inputs Moved to Top 🔄" : "Inputs Back to Bottom 🔄");
			};
		}
		const headerPlay = document.getElementById('headerplaybtn');
		if (headerPlay) headerPlay.onclick = () => playDemo();
		const headerSettingsBtn = document.getElementById('headersettingsbtn');
		if (headerSettingsBtn) headerSettingsBtn.onclick = () => { if (typeof openOrientationSettings === 'function') openOrientationSettings(); };
		const headerRedeem = document.getElementById('headerredeembtn');
		if (headerRedeem) headerRedeem.onclick = () => { if (modules.settings) modules.settings.toggleRedeem(true); };
		const headerShare = document.getElementById('headersharebtn');
		if (headerShare) headerShare.onclick = () => { if (modules.settings) modules.settings.openShare(); };
		const headerThemeCycle = document.getElementById('headerthemecyclebtn');
		if (headerThemeCycle) headerThemeCycle.onclick = () => {
			const allThemeKeys = [...Object.keys(PREMADE_THEMES), ...Object.keys(appSettings.customThemes || {})];
			if (allThemeKeys.length === 0) return;
			const curIdx = allThemeKeys.indexOf(appSettings.activeTheme);
			const nextTheme = allThemeKeys[(curIdx + 1) % allThemeKeys.length];
			appSettings.activeTheme = nextTheme;
			applyTheme(nextTheme);
			saveState();
			if (modules.settings && modules.settings.dom.themeSelect) modules.settings.dom.themeSelect.value = nextTheme;
			showToast(`Theme: ${nextTheme} 🎨`);
		};
		const headerAddMachine = document.getElementById('headeraddmachinebtn');
		if (headerAddMachine) headerAddMachine.onclick = () => {
			const settings = getProfileSettings();
			if (settings.machineCount >= CONFIG.MAX_MACHINES) { showToast(`Max ${CONFIG.MAX_MACHINES} machines 🛑`); return; }
			settings.machineCount++;
			const sel = document.getElementById('machines-select');
			if (sel) sel.value = settings.machineCount;
			renderUI();
			saveState();
			showToast(`Machines: ${settings.machineCount} ➕`);
		};
		const headerUiUp = document.getElementById('headeruiupbtn');
		if (headerUiUp) headerUiUp.onclick = () => {
			appSettings.globalUiScale = Math.min(200, (appSettings.globalUiScale || 100) + 10);
			document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
			const sel = document.getElementById('ui-scale-select');
			if (sel) sel.value = appSettings.globalUiScale;
			saveState();
			showToast(`UI: ${appSettings.globalUiScale}% 🔍`);
		};
		const headerUiDown = document.getElementById('headeruidownbtn');
		if (headerUiDown) headerUiDown.onclick = () => {
			appSettings.globalUiScale = Math.max(50, (appSettings.globalUiScale || 100) - 10);
			document.documentElement.style.fontSize = `${appSettings.globalUiScale}%`;
			const sel = document.getElementById('ui-scale-select');
			if (sel) sel.value = appSettings.globalUiScale;
			saveState();
			showToast(`UI: ${appSettings.globalUiScale}% 🔍`);
		};
		const headerSeqUp = document.getElementById('headersequpbtn');
		if (headerSeqUp) headerSeqUp.onclick = () => {
			appSettings.uiScaleMultiplier = Math.min(3.0, (appSettings.uiScaleMultiplier || 1.0) + 0.1);
			const sel = document.getElementById('seq-size-select');
			if (sel) sel.value = Math.round(appSettings.uiScaleMultiplier * 100);
			renderUI();
			saveState();
			showToast(`Cards: ${Math.round(appSettings.uiScaleMultiplier * 100)}% 🔢`);
		};
		const headerSeqDown = document.getElementById('headerseqdownbtn');
		if (headerSeqDown) headerSeqDown.onclick = () => {
			appSettings.uiScaleMultiplier = Math.max(0.5, (appSettings.uiScaleMultiplier || 1.0) - 0.1);
			const sel = document.getElementById('seq-size-select');
			if (sel) sel.value = Math.round(appSettings.uiScaleMultiplier * 100);
			renderUI();
			saveState();
			showToast(`Cards: ${Math.round(appSettings.uiScaleMultiplier * 100)}% 🔢`);
		};
		const headerVolUp = document.getElementById('headervolupbtn');
		if (headerVolUp) headerVolUp.onclick = () => {
			appSettings.runtimeSettings.voiceVolume = Math.min(1.0, (appSettings.runtimeSettings.voiceVolume || 1.0) + 0.05);
			const sel = document.getElementById('voice-volume');
			if (sel) sel.value = appSettings.runtimeSettings.voiceVolume;
			saveState();
			showToast(`Volume: ${(appSettings.runtimeSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
		};
		const headerVolDown = document.getElementById('headervoldownbtn');
		if (headerVolDown) headerVolDown.onclick = () => {
			appSettings.runtimeSettings.voiceVolume = Math.max(0.0, (appSettings.runtimeSettings.voiceVolume || 1.0) - 0.05);
			const sel = document.getElementById('voice-volume');
			if (sel) sel.value = appSettings.runtimeSettings.voiceVolume;
			saveState();
			showToast(`Volume: ${(appSettings.runtimeSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
		};
		const headerSpeedUp = document.getElementById('headerspeedupbtn');
		if (headerSpeedUp) headerSpeedUp.onclick = () => {
			appSettings.runtimeSettings.playbackSpeed = Math.min(2.0, (appSettings.runtimeSettings.playbackSpeed || 1.0) + 0.1);
			const sel = document.getElementById('playback-speed-select');
			if (sel) sel.value = appSettings.runtimeSettings.playbackSpeed.toFixed(2);
			saveState();
			showToast(`Speed: ${(appSettings.runtimeSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
		};
		const headerSpeedDown = document.getElementById('headerspeeddownbtn');
		if (headerSpeedDown) headerSpeedDown.onclick = () => {
			appSettings.runtimeSettings.playbackSpeed = Math.max(0.5, (appSettings.runtimeSettings.playbackSpeed || 1.0) - 0.1);
			const sel = document.getElementById('playback-speed-select');
			if (sel) sel.value = appSettings.runtimeSettings.playbackSpeed.toFixed(2);
			saveState();
			showToast(`Speed: ${(appSettings.runtimeSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
		};
		const headerPlayBtnEl = document.getElementById('headerplaybtn');
		if (headerPlayBtnEl) {
			let hpWasPlaying = false;
			let hpLongPressTriggered = false;
			const headerPlayDown = dedupeTouchMouseHandler(e => {
				if (e && e.cancelable) {
					e.preventDefault();
					e.stopPropagation();
				}
				hpWasPlaying = isDemoPlaying;
				hpLongPressTriggered = false;
				if (hpWasPlaying) {
					isDemoPlaying = false;
					headerPlayBtnEl.textContent = "▶️";
					showToast("Playback Stopped 🛑");
					return;
				}
				if (appSettings.isLongPressAutoplayEnabled) {
					timers.longPress = setTimeout(() => {
							hpLongPressTriggered = true;
							appSettings.runtimeSettings.isAutoplayEnabled = !appSettings.runtimeSettings.isAutoplayEnabled;
							modules.settings.updateUIFromSettings();
							showToast(`Autoplay: ${appSettings.runtimeSettings.isAutoplayEnabled ? "ON" : "OFF"}`);
							ignoreNextClick = true;
							setTimeout(() => ignoreNextClick = false, 500);
						}, 800);
				}
			});
			const headerPlayUp = dedupeTouchMouseHandler(e => {
				if (e && e.cancelable) {
					e.preventDefault();
					e.stopPropagation();
				}
				clearTimeout(timers.longPress);
				if (!hpWasPlaying && !hpLongPressTriggered) {
					playDemo();
				}
			});
			headerPlayBtnEl.addEventListener('mousedown', headerPlayDown);
			headerPlayBtnEl.addEventListener('touchstart', headerPlayDown, { passive: false });
			headerPlayBtnEl.addEventListener('mouseup', headerPlayUp);
			headerPlayBtnEl.addEventListener('touchend', headerPlayUp);
			headerPlayBtnEl.addEventListener('mouseleave', () => clearTimeout(timers.longPress));
			headerPlayBtnEl.addEventListener('touchcancel', () => clearTimeout(timers.longPress));
		}
		const headerCycleInput = document.getElementById('headercycleinputbtn');
		if (headerCycleInput) headerCycleInput.onclick = () => {
			const settings = getProfileSettings();
			const order = ['key9', 'key12', 'piano'];
			const curIdx = order.indexOf(settings.currentInput);
			settings.currentInput = order[(curIdx + 1) % order.length];
			const sel = document.getElementById('input-select');
			if (sel) sel.value = settings.currentInput;
			renderUI();
			saveState();
			showToast(`Input: ${settings.currentInput} 🔀`);
		};
		const headerNotepad = document.getElementById('headernotepadbtn');
		const notepadModal = document.getElementById('notepad-modal');
		const notepadTextarea = document.getElementById('notepad-textarea');
		const closeNotepadBtn = document.getElementById('close-notepad-btn');
		if (headerNotepad && notepadModal && notepadTextarea) {
			let notepadLongPressTimer = null;
			let notepadWasLongPress = false;
			const copyNotepadToClipboard = () => {
				const hasSelection = notepadTextarea.selectionStart !== notepadTextarea.selectionEnd;
				const text = hasSelection ? notepadTextarea.value.substring(notepadTextarea.selectionStart, notepadTextarea.selectionEnd) : (appSettings.notepadText || '');
				if (!text) { showToast('Notepad is empty 📝'); return; }
				navigator.clipboard?.writeText(text).then(() => {
						showToast(hasSelection ? 'Selection copied 📋' : 'Note copied to clipboard 📋');
				}).catch(() => showToast('Copy failed - try again'));
				hapticPulse(50);
			};
			headerNotepad.addEventListener('pointerdown', () => {
					notepadWasLongPress = false;
					notepadLongPressTimer = setTimeout(() => {
							notepadWasLongPress = true;
							copyNotepadToClipboard();
						}, 600);
			});
			const cancelNotepadLongPress = () => { if (notepadLongPressTimer) { clearTimeout(notepadLongPressTimer); notepadLongPressTimer = null; } };
			headerNotepad.addEventListener('pointerup', cancelNotepadLongPress);
			headerNotepad.addEventListener('pointerleave', cancelNotepadLongPress);
			headerNotepad.addEventListener('pointercancel', cancelNotepadLongPress);
			headerNotepad.onclick = () => {
				if (notepadWasLongPress) { notepadWasLongPress = false; return; }
				notepadTextarea.value = appSettings.notepadText || '';
				notepadModal.classList.remove('opacity-0', 'pointer-events-none');
				if (window.lockBodyScroll) window.lockBodyScroll();
				setTimeout(() => notepadTextarea.focus(), 50);
			};
			notepadTextarea.oninput = () => {
				appSettings.notepadText = notepadTextarea.value;
				saveState();
			};
			const selectAllBtn = document.getElementById('notepad-selectall-btn');
			if (selectAllBtn) selectAllBtn.onclick = () => {
				notepadTextarea.focus();
				notepadTextarea.select();
			};
			const cutBtn = document.getElementById('notepad-cut-btn');
			if (cutBtn) cutBtn.onclick = async () => {
				const start = notepadTextarea.selectionStart;
				const end = notepadTextarea.selectionEnd;
				if (start === end) { showToast('Select some text first ✂️'); return; }
				const selected = notepadTextarea.value.substring(start, end);
				try {
					await navigator.clipboard.writeText(selected);
					notepadTextarea.value = notepadTextarea.value.slice(0, start) + notepadTextarea.value.slice(end);
					notepadTextarea.setSelectionRange(start, start);
					appSettings.notepadText = notepadTextarea.value;
					saveState();
					showToast('Cut ✂️');
				} catch (e) {
					showToast('Cut failed - try again');
				}
			};
			const copyBtn = document.getElementById('notepad-copy-btn');
			if (copyBtn) copyBtn.onclick = () => copyNotepadToClipboard();
			const pasteBtn = document.getElementById('notepad-paste-btn');
			if (pasteBtn) pasteBtn.onclick = async () => {
				try {
					const clipText = await navigator.clipboard.readText();
					if (!clipText) { showToast('Clipboard is empty 📋'); return; }
					const start = notepadTextarea.selectionStart;
					const end = notepadTextarea.selectionEnd;
					notepadTextarea.value = notepadTextarea.value.slice(0, start) + clipText + notepadTextarea.value.slice(end);
					const newPos = start + clipText.length;
					notepadTextarea.setSelectionRange(newPos, newPos);
					appSettings.notepadText = notepadTextarea.value;
					saveState();
					showToast('Pasted 📥');
				} catch (e) {
					showToast('Paste blocked - your browser needs clipboard permission for this');
				}
			};
			const eraseBtn = document.getElementById('notepad-erase-btn');
			if (eraseBtn) eraseBtn.onclick = () => {
				if (!appSettings.notepadText) return;
				if (!confirm('Erase the entire note? This can\'t be undone.')) return;
				notepadTextarea.value = '';
				appSettings.notepadText = '';
				saveState();
				showToast('Note erased 🗑️');
			};
		}
		if (closeNotepadBtn && notepadModal && notepadTextarea) {
			closeNotepadBtn.onclick = () => {
				notepadTextarea.blur();
				notepadModal.classList.add('opacity-0', 'pointer-events-none');
				if (window.unlockBodyScroll) window.unlockBodyScroll();
			};
		}
		const headerHelp = document.getElementById('headerhelpbtn');
		if (headerHelp) headerHelp.onclick = () => { document.getElementById('open-help-button')?.click(); };
		const headerModeSwitch = document.getElementById('headermodeswitchbtn');
		if (headerModeSwitch) headerModeSwitch.onclick = () => {
			const settings = getProfileSettings();
			settings.currentMode = settings.currentMode === CONFIG.MODES.SIMON ? CONFIG.MODES.UNIQUE_ROUNDS : CONFIG.MODES.SIMON;
			const sel = document.getElementById('mode-select');
			if (sel) sel.value = settings.currentMode;
			renderUI();
			saveState();
			showToast(`Mode: ${settings.currentMode === CONFIG.MODES.SIMON ? 'Simon Says' : 'Unique'} 🎮`);
		};
		const headerReset = document.getElementById('headerresetbtn');
		if (headerReset) headerReset.onclick = () => { document.querySelector('button[data-action="restore-defaults"]')?.click(); };
		const headerNuke = document.getElementById('headernukebtn');
		if (headerNuke) headerNuke.onclick = () => { document.querySelector('button[data-action="nuke-app"]')?.click(); };
		if (headerTimer) {
			headerTimer.textContent = "00:00";
			headerTimer.style.fontSize = "0.75rem";
			const formatTime = ms => {
				const totalSec = Math.floor(ms / 1000);
				const m = Math.floor(totalSec / 60);
				const s = totalSec % 60;
				return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
			};
			const updateTimer = () => {
				const now = Date.now();
				const diff = now - simpleTimer.startTime + simpleTimer.elapsed;
				headerTimer.textContent = formatTime(diff);
			};
			globalTimerActions.start = () => {
				if (!simpleTimer.isRunning) {
					simpleTimer.startTime = Date.now();
					simpleTimer.interval = setInterval(updateTimer, 100);
					simpleTimer.isRunning = true;
				}
			};
			globalTimerActions.stop = () => {
				if (simpleTimer.isRunning) {
					clearInterval(simpleTimer.interval);
					simpleTimer.elapsed += Date.now() - simpleTimer.startTime;
					simpleTimer.isRunning = false;
				}
			};
			globalTimerActions.reset = () => {
				clearInterval(simpleTimer.interval);
				simpleTimer.isRunning = false;
				simpleTimer.elapsed = 0;
				headerTimer.textContent = "00:00";
			};
			const toggleTimer = () => {
				if (simpleTimer.isRunning) globalTimerActions.stop();
				else globalTimerActions.start();
				vibrate();
			};
			const resetTimer = () => {
				globalTimerActions.reset();
				showToast("Timer Reset");
				vibrate();
			};
			let tTimer;
			let tIsLong = false;
			const startT = e => {
				if (e.type === 'mousedown' && e.button !== 0) return;
				tIsLong = false;
				tTimer = setTimeout(() => {
						tIsLong = true;
						resetTimer();
					}, 600);
			};
			const endT = dedupeTouchMouseHandler(e => {
				if (e) e.preventDefault();
				clearTimeout(tTimer);
				if (!tIsLong) toggleTimer();
			});
			headerTimer.addEventListener('mousedown', startT);
			headerTimer.addEventListener('touchstart', startT, {
					passive: true
			});
			headerTimer.addEventListener('mouseup', endT);
			headerTimer.addEventListener('touchend', endT);
			headerTimer.addEventListener('mouseleave', () => clearTimeout(tTimer));
		}
		if (headerCounter) {
			headerCounter.textContent = simpleCounter.toString();
			headerCounter.style.fontSize = "1.2rem";
			const updateCounter = () => {
				headerCounter.textContent = simpleCounter;
			};
			globalCounterActions.increment = () => {
				simpleCounter++;
				updateCounter();
			};
			globalCounterActions.reset = () => {
				simpleCounter = 0;
				updateCounter();
			};
			const increment = () => {
				globalCounterActions.increment();
				vibrate();
			};
			const resetCounter = () => {
				globalCounterActions.reset();
				showToast("Counter Reset");
				vibrate();
			};
			let cTimer;
			let cIsLong = false;
			const startC = e => {
				if (e.type === 'mousedown' && e.button !== 0) return;
				cIsLong = false;
				cTimer = setTimeout(() => {
						cIsLong = true;
						resetCounter();
					}, 600);
			};
			const endC = dedupeTouchMouseHandler(e => {
				if (e) e.preventDefault();
				clearTimeout(cTimer);
				if (!cIsLong) increment();
			});
			headerCounter.addEventListener('mousedown', startC);
			headerCounter.addEventListener('touchstart', startC, {
					passive: true
			});
			headerCounter.addEventListener('mouseup', endC);
			headerCounter.addEventListener('touchend', endC);
			headerCounter.addEventListener('mouseleave', () => clearTimeout(cTimer));
		}
		if (headerMic) {
			headerMic.onclick = () => {
				if (!voiceModule) return;
				const isActive = !voiceModule.isListening;
				voiceModule.toggle(isActive);
				headerMic.classList.toggle('header-btn-active', isActive);
			};
		}
		if (headerTouchGesture) {
			headerTouchGesture.onclick = () => {
				isTouchGesturePadVisible = !isTouchGesturePadVisible;
				headerTouchGesture.classList.toggle('header-btn-active', isTouchGesturePadVisible);
				const gpWrap = document.getElementById('gesture-pad-wrapper');
				if (gpWrap) {
					if (isTouchGesturePadVisible) {
						gpWrap.classList.remove('hidden');
						showToast("Pad Visible 🗒️");
					} else {
						gpWrap.classList.add('hidden');
						showToast("Pad Hidden");
					}
				}
				renderUI();
			};
		}
	} catch (e) {
		console.error("Listener Error:", e);
	}
}
window.wakelockToggle = async function(enable) {
	try {
		if (('wakeLock' in navigator)) {
			if (enable) {
				screenWakeLock = await navigator.wakeLock.request('screen');
				document.addEventListener('visibilitychange', reacquireWakeLock);
				console.log('Wake Lock: ACTIVE 💡');
			} else {
				if (screenWakeLock) {
					await screenWakeLock.release();
					screenWakeLock = null;
				}
				document.removeEventListener('visibilitychange', reacquireWakeLock);
				console.log('Wake Lock: RELEASED 🔋');
			}
		}
	} catch (err) {
		console.warn('Wake Lock failed:', err);
	}
};
function getPhysicalOrientationAngle() {
	// Returns { angle, confident }. angle is always a best-effort value; confident means
	// screen.orientation.angle itself confirmed it (90/270 while the viewport is genuinely
	// landscape-shaped). When not confident, there is no reliable way to pick between the two
	// possible landscape directions - they differ by 180deg, so a static guess is right for
	// one and upside-down for the other, roughly half the time either way.
	const isLandscape = window.innerWidth > window.innerHeight;
	const apiAngle = (window.screen?.orientation && typeof window.screen.orientation.angle === 'number')
		? window.screen.orientation.angle
		: null;
	if (isLandscape) {
		if (apiAngle === 90 || apiAngle === 270) return { angle: apiAngle, confident: true };
		return { angle: 90, confident: false };
	}
	if (apiAngle === 180) return { angle: 180, confident: true };
	return { angle: 0, confident: true };
}
function computeAndApplyRotation() {
	const upsideDown = document.body.dataset.upsideDown === '1';
	let total;
	if (isPortraitLocked) {
		const physical = getPhysicalOrientationAngle();
		if (physical.confident) {
			total = ((360 - physical.angle) % 360 + (upsideDown ? 180 : 0)) % 360;
		} else {
			// Can't confidently compensate for landscape direction - rather than a coin-flip
			// guess that risks rendering upside-down, fall back to natural layout (still
			// applies the Upside Down flip on its own, since that has no direction ambiguity).
			total = upsideDown ? 180 : 0;
		}
	} else if (isLandscapeLocked) {
		const isPhysicallyLandscape = window.innerWidth > window.innerHeight;
		if (isPhysicallyLandscape) {
			// Already presenting landscape naturally - no compensation needed beyond Upside Down.
			total = upsideDown ? 180 : 0;
		} else {
			// Physically portrait - rotate 90deg to force a landscape presentation. Direction
			// (90 vs 270) can't be reliably determined without more sensor data, so this
			// defaults to 90 and Upside Down can correct it if it renders backwards.
			total = (90 + (upsideDown ? 180 : 0)) % 360;
		}
	} else {
		total = upsideDown ? 180 : 0;
	}
	document.body.dataset.rotate = String(total);
}
function orientationLockSupported() {
	return !!(window.screen?.orientation && typeof window.screen.orientation.lock === 'function');
}
function isHeaderBtnOn(id) {
	const btn = document.getElementById(id);
	return !!(btn && (btn.classList.contains('ring-2') || btn.classList.contains('header-btn-active')));
}
// Shared by Pinned Mode, Portrait Lock, Landscape Lock, and the plain Fullscreen button - all
// four can independently request fullscreen, so exiting must only happen once none of them
// still need it, otherwise turning one off would yank fullscreen out from under the others.
function releaseFullscreenIfUnused() {
	if (appSettings.isPinnedModeEnabled || isPortraitLocked || isLandscapeLocked || isHeaderBtnOn('headerfullscreenbtn')) return;
	try {
		if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
	} catch (err) {
		console.warn('[Fullscreen] exit failed:', err && err.message);
	}
}
function updatePortraitLockBtnState() {
	const btn = document.getElementById('headerportraitlockbtn');
	if (!btn) return;
	btn.classList.toggle('ring-2', isPortraitLocked);
	btn.classList.toggle('ring-emerald-500', isPortraitLocked);
}
function updateLandscapeLockBtnState() {
	const btn = document.getElementById('headerlandscapelockbtn');
	if (!btn) return;
	btn.classList.toggle('ring-2', isLandscapeLocked);
	btn.classList.toggle('ring-emerald-500', isLandscapeLocked);
}
async function attemptNativeLockBestEffort() {
	// Best-effort only: on devices where this actually works it reinforces the visual
	// compensation (angle stays 0, so computeAndApplyRotation is a no-op). On devices
	// where it doesn't - which is most installed Android WebAPKs, per platform research -
	// the CSS compensation above is what's actually doing the work, so failure here is fine.
	if (!orientationLockSupported()) return;
	try {
		await window.screen.orientation.lock('portrait-primary');
	} catch (e) {
		try { await window.screen.orientation.lock('portrait'); } catch (e2) { /* expected on many devices */ }
	}
}
async function attemptNativeLandscapeLockBestEffort() {
	if (!orientationLockSupported()) return;
	try {
		await window.screen.orientation.lock('landscape-primary');
	} catch (e) {
		try { await window.screen.orientation.lock('landscape'); } catch (e2) { /* expected on many devices */ }
	}
}
function lockPortraitOrientation() {
	// Set the new state before releasing the old one, so if Landscape Lock was active,
	// its unlock sees Portrait Lock already on and won't needlessly drop fullscreen.
	isPortraitLocked = true;
	if (isLandscapeLocked) unlockLandscapeOrientation();
	attemptNativeLockBestEffort();
	updatePortraitLockBtnState();
	computeAndApplyRotation();
	if (typeof requestAppFullscreen === 'function') requestAppFullscreen();
	return true;
}
function unlockOrientation() {
	if (orientationLockSupported()) {
		try { window.screen.orientation.unlock(); } catch (e) { /* non-fatal, CSS compensation is already off */ }
	}
	isPortraitLocked = false;
	updatePortraitLockBtnState();
	computeAndApplyRotation();
	releaseFullscreenIfUnused();
	if (typeof showToast === 'function') showToast('Portrait Lock: OFF 🔓');
}

window.toggleOrientationLock = function() {
	if (isPortraitLocked) {
		unlockOrientation();
	} else {
		lockPortraitOrientation();
		if (typeof showToast === 'function') showToast('Portrait Lock: ON 🔒');
	}
};
function lockLandscapeOrientation() {
	// Set the new state before releasing the old one, so if Portrait Lock was active,
	// its unlock sees Landscape Lock already on and won't needlessly drop fullscreen.
	isLandscapeLocked = true;
	if (isPortraitLocked) unlockOrientation();
	attemptNativeLandscapeLockBestEffort();
	updateLandscapeLockBtnState();
	computeAndApplyRotation();
	if (typeof requestAppFullscreen === 'function') requestAppFullscreen();
	return true;
}
function unlockLandscapeOrientation() {
	if (orientationLockSupported()) {
		try { window.screen.orientation.unlock(); } catch (e) { /* non-fatal, CSS compensation is already off */ }
	}
	isLandscapeLocked = false;
	updateLandscapeLockBtnState();
	computeAndApplyRotation();
	releaseFullscreenIfUnused();
	if (typeof showToast === 'function') showToast('Landscape Lock: OFF 🔓');
}
window.toggleLandscapeLock = function() {
	if (isLandscapeLocked) {
		unlockLandscapeOrientation();
	} else {
		lockLandscapeOrientation();
		if (typeof showToast === 'function') showToast('Landscape Lock: ON 🔒');
	}
};
function pipSupported() {
	return !!(document.pictureInPictureEnabled && HTMLCanvasElement.prototype.captureStream);
}
function readVisibleSequence(machineIndex) {
	if (typeof machineIndex === 'number') {
		const state = getState();
		const seq = (state && state.sequences && state.sequences[machineIndex]) || [];
		return seq.map(v => String(v));
	}
	const container = document.getElementById('sequence-container');
	if (!container) return [];
	return Array.from(container.querySelectorAll('.number-box'))
	.map(el => (el.textContent || '').trim())
	.filter(t => t.length);
}
function drawPipFrame() {
	if (!pipCanvas) return;
	const ctx = pipCanvas.getContext('2d');
	const cs = getComputedStyle(document.body);
	const bg = cs.getPropertyValue('--bg-main').trim() || '#111827';
	const bubble = cs.getPropertyValue('--seq-bubble').trim() || '#6366f1';
	const textCol = cs.getPropertyValue('--text-main').trim() || '#ffffff';
	const W = pipCanvas.width, H = pipCanvas.height;
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, W, H);
	// Fixed behavior at 33%/50h/50v/66%: the popup always shows Machine 1 (index 0), full stop -
	// not the configurable pipMachineIndex, which only still applies in Landscape/Portrait.
	const restrictedBucket = isPipRestrictedBucket(document.body.dataset.viewportBucket);
	const pipMachineToShow = restrictedBucket ? 0 : (typeof appSettings.pipMachineIndex === 'number' ? appSettings.pipMachineIndex : undefined);
	const vals = readVisibleSequence(pipMachineToShow);
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	if (!vals.length) {
		ctx.fillStyle = textCol;
		ctx.font = '600 26px system-ui, sans-serif';
		ctx.fillText('No sequence yet', W / 2, H / 2);
		return;
	}
	const n = vals.length;
	let cols = Math.max(1, Math.min(n, Math.ceil(Math.sqrt(n * W / H))));
	let rows = Math.ceil(n / cols);
	const gap = 10;
	const size = Math.max(24, Math.min(
			(W - gap * (cols + 1)) / cols,
			(H - gap * (rows + 1)) / rows
	));
	const gridW = cols * size + gap * (cols - 1);
	const gridH = rows * size + gap * (rows - 1);
	const startX = (W - gridW) / 2;
	const startY = (H - gridH) / 2;
	const radius = Math.min(12, size * 0.22);
	ctx.font = `700 ${Math.round(size * 0.5)}px system-ui, sans-serif`;
	for (let i = 0; i < n; i++) {
		const c = i % cols, r = Math.floor(i / cols);
		const x = startX + c * (size + gap);
		const y = startY + r * (size + gap);
		ctx.fillStyle = bubble;
		ctx.beginPath();
		if (ctx.roundRect) ctx.roundRect(x, y, size, size, radius);
		else ctx.rect(x, y, size, size);
		ctx.fill();
		ctx.fillStyle = pickReadableInk(bubble);
		ctx.fillText(vals[i], x + size / 2, y + size / 2);
	}
}
function pickReadableInk(bgColor) {
	const probe = document.createElement('div');
	probe.style.color = bgColor;
	document.body.appendChild(probe);
	const rgb = getComputedStyle(probe).color.match(/\d+/g);
	probe.remove();
	if (!rgb) return '#ffffff';
	const [r, g, b] = rgb.map(Number);
	const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
	return lum > 0.6 ? '#111111' : '#ffffff';
}
async function enterPipMode() {
	if (!pipSupported()) {
		showToast('Picture-in-Picture not supported on this browser 🪟');
		return false;
	}
	try {
		if (!pipCanvas) {
			pipCanvas = document.createElement('canvas');
			pipCanvas.width = 480;
			pipCanvas.height = 270;
		}
		if (!pipVideo) {
			pipVideo = document.createElement('video');
			pipVideo.muted = true;
			pipVideo.playsInline = true;
			pipVideo.setAttribute('playsinline', '');
			pipVideo.style.cssText = 'position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
			document.body.appendChild(pipVideo);
			pipVideo.addEventListener('leavepictureinpicture', () => {
					stopPipLoop();
					const t = document.getElementById('pipToggle');
					if (t) t.checked = false;
					const b = document.getElementById('headerpipbtn');
					if (b) b.classList.remove('ring-2', 'ring-emerald-500');
					syncPipSequenceOnlyMode();
			});
		}
		drawPipFrame();
		if (!pipStream) {
			pipStream = pipCanvas.captureStream(5);
			pipVideo.srcObject = pipStream;
		}
		await pipVideo.play();
		await pipVideo.requestPictureInPicture();
		if (pipTimer) clearInterval(pipTimer);
		pipTimer = setInterval(drawPipFrame, 200);
		syncPipSequenceOnlyMode();
		return true;
	} catch (err) {
		console.warn('[PiP] could not open Picture-in-Picture:', err);
		showToast('Could not open Picture-in-Picture 🪟');
		stopPipLoop();
		return false;
	}
}
function stopPipLoop() {
	if (pipTimer) { clearInterval(pipTimer); pipTimer = null; }
}
async function exitPipMode() {
	stopPipLoop();
	try {
		if (document.pictureInPictureElement) await document.exitPictureInPicture();
	} catch (err) {
		console.warn('[PiP] exit failed:', err);
	}
	syncPipSequenceOnlyMode();
}
async function requestAppFullscreen() {
	const el = document.documentElement;
	try {
		if (document.fullscreenElement) return true;
		if (el.requestFullscreen) { await el.requestFullscreen({ navigationUI: 'hide' }); return true; }
		if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); return true; }
	} catch (err) {
		console.warn('[Pinned] fullscreen refused:', err && err.message);
	}
	return false;
}
function armPinnedBackTrap() {
	if (pinnedPopHandler) return;
	history.pushState({ pinned: true }, '');
	pinnedPopHandler = () => {
		if (!appSettings.isPinnedModeEnabled) return;
		history.pushState({ pinned: true }, '');
		showToast('Pinned 📌 - turn off Pinned Mode in Settings to leave');
	};
	window.addEventListener('popstate', pinnedPopHandler);
}
function disarmPinnedBackTrap() {
	if (!pinnedPopHandler) return;
	window.removeEventListener('popstate', pinnedPopHandler);
	pinnedPopHandler = null;
}
async function enterPinnedMode() {
	document.body.classList.add('pinned-mode');
	armPinnedBackTrap();
	await requestAppFullscreen();
	showToast('Pinned 📌 - back gesture is blocked');
}
async function exitPinnedMode() {
	document.body.classList.remove('pinned-mode');
	disarmPinnedBackTrap();
	if (pinnedFullscreenRearm) {
		window.removeEventListener('pointerdown', pinnedFullscreenRearm);
		pinnedFullscreenRearm = null;
	}
	releaseFullscreenIfUnused();
}
window.modules = modules;
window.snapshotForUndo = snapshotForUndo;
window.performUndo = performUndo;
window.getState = getState;
window.renderUI = renderUI;
window.settingsToBackupCode = settingsToBackupCode;
window.importSettingsFromBackupCode = importSettingsFromBackupCode;
window.diffAgainstDefaults = diffAgainstDefaults;
window.mergeWithDefaults = mergeWithDefaults;
window.DEFAULT_APP = DEFAULT_APP;
window.DEFAULT_HEADER_BTN_ORDER = DEFAULT_HEADER_BTN_ORDER;
window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;
// Exposed so the Landscape/Split Screen configure modal's live preview iframe (a module script,
// so top-level function declarations don't auto-attach to window) can push unsaved slider/select
// edits into the iframe and force it to re-render without a full page reload.
window.applyViewportProfile = applyViewportProfile;
window.applyViewportHeaderButtonCuration = applyViewportHeaderButtonCuration;
window.applyLandscapeInputWidth = applyLandscapeInputWidth;
window.getEffectiveHeaderScale = getEffectiveHeaderScale;
window.getEffectiveNumberSize = getEffectiveNumberSize;
window.getEffectiveInputFontSize = getEffectiveInputFontSize;
window.getEffectiveInputBtnSize = getEffectiveInputBtnSize;
window.getEffectiveInputAreaEnabled = getEffectiveInputAreaEnabled;
window.getEffectiveInputAreaPct = getEffectiveInputAreaPct;
window.detectViewportBucket = detectViewportBucket;
window.getEffectiveGlobalUiScale = getEffectiveGlobalUiScale;
window.getEffectiveSeqScaleMultiplier = getEffectiveSeqScaleMultiplier;
function wireHeaderButtonInteractions() {
	const $ = id => document.getElementById(id);
	const isOn = id => isHeaderBtnOn(id);
	// Reuses each button's own existing off-logic by synthetically re-clicking it, rather than
	// duplicating that logic here - safe against loops because every listener below only acts
	// when the button is currently ON, so a button being turned off never re-triggers itself.
	const turnOff = id => { const btn = $(id); if (btn && isOn(id)) btn.click(); };

	// AR Mode occupies the camera/screen and conflicts with the other input-assist modes and
	// PiP, so activating it turns all of them off.
	const arBtn = $('headerarcambtn');
	if (arBtn) {
		arBtn.addEventListener('click', () => {
			if (isOn('headerarcambtn')) {
				['headerpipbtn', 'headervoicebtn', 'headertonebtn', 'headertouchbtn', 'headerhandbtn'].forEach(turnOff);
			}
		});
	}

	// Voice, Tone Cadence, Touch Gesture Pad, and Hand Tracking are all mutually exclusive input
	// assist modes - only one can be active at a time, so activating one turns the others off.
	const exclusiveInputBtns = ['headervoicebtn', 'headertonebtn', 'headertouchbtn', 'headerhandbtn'];
	exclusiveInputBtns.forEach(selfId => {
		const btn = $(selfId);
		if (!btn) return;
		btn.addEventListener('click', () => {
			if (isOn(selfId)) {
				exclusiveInputBtns.filter(id => id !== selfId).forEach(turnOff);
			}
		});
	});

	// PiP shares screen space with the sequence view, so it's automatically released whenever
	// fullscreen activates (from the Fullscreen button itself, Pinned Mode, Portrait Lock, or
	// Landscape Lock - this listener covers all of those entry points at once).
	document.addEventListener('fullscreenchange', () => {
		if (document.fullscreenElement) turnOff('headerpipbtn');
	});

	// Draggable divider between the sequence area and the input panel in landscape/split-screen
	// key9/key12 mode (opt-in via "Resizable Input Area" in General). Replaces the input panel's
	// old fixed width (100vh, i.e. sized off the device's height regardless of how narrow a
	// split-screen window actually is) with a percentage of the real available viewport width
	// that the person can drag to their own preference, persisted across sessions.
	const resizeHandle = $('landscape-resize-handle');
	if (resizeHandle) {
		let isDraggingDivider = false;
		const onDividerMove = (e) => {
			if (!isDraggingDivider) return;
			e.preventDefault();
			const swapped = document.body.classList.contains('layout-swapped');
			// The input panel sits on the right normally, left when layout is swapped - the
			// fraction of screen width it should occupy is measured from whichever edge it's
			// actually anchored to, matching the CSS above (right: 0 / left: 0 respectively).
			const rawPct = swapped
				? (e.clientX / window.innerWidth) * 100
				: ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
			const clamped = Math.min(80, Math.max(20, rawPct));
			appSettings.landscapeInputWidthPct = Math.round(clamped);
			document.documentElement.style.setProperty('--landscape-input-width', clamped + 'vw');
		};
		const onDividerUp = () => {
			if (!isDraggingDivider) return;
			isDraggingDivider = false;
			document.body.classList.remove('landscape-resize-dragging');
			saveState();
			document.removeEventListener('pointermove', onDividerMove);
			document.removeEventListener('pointerup', onDividerUp);
			document.removeEventListener('pointercancel', onDividerUp);
		};
		resizeHandle.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			isDraggingDivider = true;
			document.body.classList.add('landscape-resize-dragging');
			document.addEventListener('pointermove', onDividerMove, { passive: false });
			document.addEventListener('pointerup', onDividerUp);
			document.addEventListener('pointercancel', onDividerUp);
		});
	}

	// Same idea as above but for portrait mode, where the sequence area and input panel are
	// stacked vertically instead of side by side - drags the horizontal divider to change the
	// input panel's height instead of width.
	const portraitResizeHandle = $('portrait-resize-handle');
	if (portraitResizeHandle) {
		let isDraggingPortraitDivider = false;
		const onPortraitDividerMove = (e) => {
			if (!isDraggingPortraitDivider) return;
			e.preventDefault();
			const swapped = document.body.classList.contains('layout-swapped');
			// Normally the input panel is anchored to the bottom of the screen, so its height is
			// measured up from the bottom edge; layout-swapped anchors it to the top instead,
			// matching the CSS above (bottom: 0 / top: 0 respectively).
			const rawPct = swapped
				? (e.clientY / window.innerHeight) * 100
				: ((window.innerHeight - e.clientY) / window.innerHeight) * 100;
			const clamped = Math.min(80, Math.max(20, rawPct));
			appSettings.portraitInputHeightPct = Math.round(clamped);
			document.documentElement.style.setProperty('--portrait-input-height', clamped + 'vh');
		};
		const onPortraitDividerUp = () => {
			if (!isDraggingPortraitDivider) return;
			isDraggingPortraitDivider = false;
			document.body.classList.remove('landscape-resize-dragging');
			saveState();
			document.removeEventListener('pointermove', onPortraitDividerMove);
			document.removeEventListener('pointerup', onPortraitDividerUp);
			document.removeEventListener('pointercancel', onPortraitDividerUp);
		};
		portraitResizeHandle.addEventListener('pointerdown', (e) => {
			e.preventDefault();
			isDraggingPortraitDivider = true;
			document.body.classList.add('landscape-resize-dragging');
			document.addEventListener('pointermove', onPortraitDividerMove, { passive: false });
			document.addEventListener('pointerup', onPortraitDividerUp);
			document.addEventListener('pointercancel', onPortraitDividerUp);
		});
	}
}
// Shared UI-builder helpers for the Landscape/Split Screen viewport configure modal - each one
// is parameterized by the target container div and the real per-bucket profile object.
function vpMakeSectionLabel(container, text) {
	const el = document.createElement('div');
	el.style.cssText = 'color: #6366f1; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin: 14px 0 8px; border-top: 1px solid #333; padding-top: 12px;';
	el.textContent = text;
	container.appendChild(el);
}
// Both helpers now write straight into the real profile object (and fire onCommit immediately)
// instead of buffering into a tempSettings object that only got merged in on an explicit Save -
// per-bucket viewport settings save the instant they change, same as everywhere else in Settings.
function vpMakeSlider(container, profile, onCommit, label, key, min, max, step, suffix, fallback) {
	const div = document.createElement('div');
	div.style.cssText = 'margin-bottom: 12px;';
	const labelEl = document.createElement('label');
	labelEl.style.cssText = 'display: block; color: #aaa; font-size: 11px; font-weight: bold; margin-bottom: 4px;';
	labelEl.textContent = label;
	const input = document.createElement('input');
	input.type = 'range';
	input.min = min;
	input.max = max;
	input.step = step;
	const curVal = profile[key] !== undefined ? profile[key] : (fallback !== undefined ? fallback : min);
	input.value = curVal;
	input.style.cssText = 'width: 100%; cursor: pointer;';
	const valueSpan = document.createElement('span');
	valueSpan.style.cssText = 'display: inline-block; color: #fff; font-size: 11px; margin-left: 8px; min-width: 30px;';
	valueSpan.textContent = curVal + suffix;
	labelEl.appendChild(valueSpan);
	input.onchange = input.oninput = (e) => {
		profile[key] = parseInt(e.target.value, 10);
		valueSpan.textContent = e.target.value + suffix;
		onCommit();
	};
	div.appendChild(labelEl);
	div.appendChild(input);
	container.appendChild(div);
	return input;
}
function vpMakeSelect(container, profile, onCommit, label, key, options, defaultVal, isNumeric) {
	const div = document.createElement('div');
	div.style.cssText = 'margin-bottom: 12px;';
	const labelEl = document.createElement('label');
	labelEl.style.cssText = 'display: block; color: #aaa; font-size: 11px; font-weight: bold; margin-bottom: 4px;';
	labelEl.textContent = label;
	const select = document.createElement('select');
	select.style.cssText = 'width: 100%; padding: 6px; background: #2a2a2a; color: #fff; border: 1px solid #444; border-radius: 4px; font-size: 11px;';
	options.forEach(opt => {
		const o = document.createElement('option');
		o.value = opt.value;
		o.textContent = opt.text;
		select.appendChild(o);
	});
	const curVal = profile[key] !== undefined ? profile[key] : defaultVal;
	select.value = curVal;
	select.onchange = (e) => {
		profile[key] = isNumeric ? parseInt(e.target.value, 10) : e.target.value;
		onCommit();
	};
	div.appendChild(labelEl);
	div.appendChild(select);
	container.appendChild(div);
	return select;
}
function vpPercentOptions(min, max, step) {
	const opts = [];
	for (let v = min; v <= max; v += step) opts.push({ value: String(v), text: v + '%' });
	return opts;
}
let viewportConfigState = { configBucket: null, activeTab: 'landscape' };

// Real screen ratio bands, matching detectViewportBucket() exactly, so the iframe's pixel
// width corresponds to what that bucket actually looks like on this device.
const VP_BUCKET_RATIO = { landscape: 1.0, split66: 0.66, split50v: 0.5, split50h: 0.5, split33: 0.33 };

// Curated header buttons available at 50%/33% - matches the memory spec:
// Timer, Counter, Play, Delete, Bigger Buttons, Swap Position, PiP, Touch Gestures
const VP_CURATED_HEADER_BUTTONS = [
	{ id: 'timer', label: '⏱️ Timer' },
	{ id: 'counter', label: '🔢 Counter' },
	{ id: 'play', label: '▶️ Play' },
	{ id: 'delete', label: '⌫ Delete' },
	{ id: 'bigger', label: '🔲 Bigger Buttons' },
	{ id: 'swap', label: '🔄 Swap Position' },
	{ id: 'pip', label: '🪟 Picture-in-Picture' },
	{ id: 'touch', label: '👆 Touch Gestures' }
];

function vpGetIframeTargetSize(bucket) {
	const screenW = (window.screen && window.screen.width) ? window.screen.width : window.innerWidth;
	const screenH = (window.screen && window.screen.height) ? window.screen.height : window.innerHeight;
	// The device's own landscape dimensions: width is the long edge, height the short edge,
	// matching what detectViewportBucket() assumes when it says "deviceIsLandscape".
	const fullW = Math.max(screenW, screenH);
	const fullH = Math.min(screenW, screenH);
	const ratio = VP_BUCKET_RATIO[bucket] || 1.0;
	// split50v is the one bucket that's ALWAYS stacked/portrait-shaped, never side-by-side (see
	// applyViewportProfile() forcing portraitSplitLayout='stacked' unconditionally for it) - every
	// other ratio-based bucket here (landscape/66/50h/33) is a landscape-shaped, side-by-side pane
	// where the ratio should shrink WIDTH off the long edge, height staying full short-edge. Using
	// that same formula for split50v gave it a wide-and-short landscape-shaped iframe (e.g.
	// 458x412) instead of the tall-and-narrow portrait-shaped one it actually renders as on a real
	// device (e.g. 412x458) - full device width, HEIGHT cut to the ratio instead of width. Since
	// the preview iframe's own physical dimensions are what "vh"/"vw" resolve against inside it,
	// that swapped aspect ratio was silently feeding every height-based calculation (Adjust Input
	// Area's own height math among them) the wrong basis, on top of just looking visibly wrong.
	if (bucket === 'split50v') {
		return { width: fullH, height: Math.round(fullW * ratio) };
	}
	return { width: Math.round(fullW * ratio), height: fullH };
}

function vpFitIframeToWrapper() {
	const wrap = document.getElementById('viewport-config-frame-wrap');
	const scaler = document.getElementById('viewport-config-frame-scaler');
	const iframe = document.getElementById('viewport-config-iframe');
	if (!wrap || !scaler || !iframe || !viewportConfigState.configBucket) return;
	const target = vpGetIframeTargetSize(viewportConfigState.configBucket);
	iframe.style.width = target.width + 'px';
	iframe.style.height = target.height + 'px';
	scaler.style.width = target.width + 'px';
	scaler.style.height = target.height + 'px';
	const wrapW = wrap.clientWidth || target.width;
	const scale = Math.min(1, wrapW / target.width);
	scaler.style.transform = `scale(${scale})`;
	wrap.style.height = (target.height * scale) + 'px';
	const dimsEl = document.getElementById('viewport-config-dims');
	if (dimsEl) dimsEl.textContent = `${target.width}×${target.height}px real size, shown at ${Math.round(scale * 100)}% zoom to fit`;
}

function vpLoadPreviewIframe(bucket) {
	const iframe = document.getElementById('viewport-config-iframe');
	if (!iframe) return;
	vpFitIframeToWrapper();
	iframe.src = './index.html?vpPreview=1&vpBucket=' + encodeURIComponent(bucket);
}

// Pushes the real, already-saved profile into the live iframe so the preview updates
// immediately as sliders/selects/checkboxes change, without a full reload. Settings commit
// straight to appSettings.viewportProfiles[bucket] now (see vpMakeSlider/vpMakeSelect), so this
// just mirrors that same object into the iframe's separate copy instead of replaying a diff.
function vpPushLiveEditsToPreview() {
	const iframe = document.getElementById('viewport-config-iframe');
	if (!iframe || !iframe.contentWindow || !viewportConfigState.configBucket) return;
	const win = iframe.contentWindow;
	try {
		if (!win.appSettings || !win.appSettings.viewportProfiles) return;
		const bucket = viewportConfigState.configBucket;
		const realProfile = appSettings.viewportProfiles[bucket];
		if (!realProfile) return;
		win.appSettings.viewportProfiles[bucket] = JSON.parse(JSON.stringify(realProfile));
		if (typeof win.applyViewportProfile === 'function') win.applyViewportProfile();
		if (typeof win.renderUI === 'function') win.renderUI();
		if (win.document && win.document.documentElement) {
			win.document.documentElement.style.fontSize = (typeof win.getEffectiveGlobalUiScale === 'function' ? win.getEffectiveGlobalUiScale() : 100) + '%';
		}
		if (win.modules && win.modules.settings) {
			if (typeof win.modules.settings.applyRowMax === 'function') win.modules.settings.applyRowMax();
			if (typeof win.modules.settings.applyHeaderScale === 'function') win.modules.settings.applyHeaderScale();
			if (typeof win.modules.settings.applyInputFontScale === 'function') win.modules.settings.applyInputFontScale();
			if (typeof win.modules.settings.applyInputBtnScale === 'function') win.modules.settings.applyInputBtnScale();
		}
		if (typeof win.applyLandscapeInputWidth === 'function') win.applyLandscapeInputWidth();
	} catch (e) {
		// Cross-origin or not-yet-loaded - safe to ignore, next reload will pick it up.
	}
}

function vpRenderConfigScreen() {
	vpFitIframeToWrapper();
	vpPushLiveEditsToPreview();
}

if (!window.__vpResizeListenerBound) {
	window.__vpResizeListenerBound = true;
	window.addEventListener('resize', () => {
		if (viewportConfigState.configBucket) vpFitIframeToWrapper();
	});
}

function initViewportProfilesUI() {
	const buckets = ['landscape', 'split66', 'split50v', 'split50h', 'split33'];
	const tabBtns = {};
	const panels = {};
	buckets.forEach(b => {
		tabBtns[b] = document.getElementById('viewport-tab-btn-' + b);
		panels[b] = document.getElementById('viewport-panel-' + b);
	});
	viewportConfigState.activeTab = 'landscape';

	function renderPreview() {
		const screen = document.getElementById('viewport-preview-screen');
		const headerEl = document.getElementById('viewport-preview-header');
		const seqEl = document.getElementById('viewport-preview-seq');
		const inputsEl = document.getElementById('viewport-preview-inputs');
		if (!screen || !headerEl || !seqEl || !inputsEl) return;
		const bucket = viewportConfigState.activeTab;
		const profile = (appSettings.viewportProfiles && appSettings.viewportProfiles[bucket]) || { uiScale: 100, seqSize: 100 };
		// Shape the mockup screen to actually match how this bucket really renders: split50v is
		// always a stacked, taller-than-wide pane (full width, short height) - drawing it as the
		// same short/wide rectangle as the side-by-side buckets is exactly what made this preview
		// look "way off" for that tab. Side-by-side buckets (landscape/66/50h/33) keep the
		// wide/short shape, sized off the same VP_BUCKET_RATIO used by the real Configure modal
		// preview instead of a hand-tuned, inconsistent pixel table.
		const isStackedShape = (bucket === 'split50v');
		const baseLong = 220, baseShort = 124;
		if (isStackedShape) {
			screen.style.width = baseShort + 'px';
			screen.style.height = baseLong + 'px';
		} else {
			const ratio = VP_BUCKET_RATIO[bucket] || 1.0;
			screen.style.width = Math.max(64, Math.round(baseLong * ratio)) + 'px';
			screen.style.height = baseShort + 'px';
		}
		headerEl.innerHTML = '';
		const dotCount = (bucket === 'split50v' || bucket === 'split50h' || bucket === 'split33') ? 8 : 12;
		for (let i = 0; i < dotCount; i++) {
			const dot = document.createElement('div');
			dot.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#4b5563;flex-shrink:0;';
			headerEl.appendChild(dot);
		}
		seqEl.innerHTML = '';
		const seqScale = (profile.seqSize || 100) / 100;
		const bubbleSize = Math.max(6, Math.round(10 * seqScale));
		for (let i = 0; i < 5; i++) {
			const bubble = document.createElement('div');
			bubble.style.cssText = `width:${bubbleSize}px;height:${bubbleSize}px;border-radius:3px;background:#6366f1;flex-shrink:0;`;
			seqEl.appendChild(bubble);
		}
		inputsEl.innerHTML = '';
		const uiScale = (profile.uiScale || 100) / 100;
		const btnW = Math.max(8, Math.round(14 * uiScale));
		const btnH = Math.max(6, Math.round(8 * uiScale));
		// Alignment now lives only on the real profile (the inline per-tab selects were removed) -
		// reading it straight from appSettings keeps this preview honest even though there's no
		// longer a DOM select to check.
		const isVertical = (bucket === 'split50v' || bucket === 'split50h') && profile.alignment === 'vertical';
		inputsEl.style.flexDirection = isVertical ? 'column' : 'row';
		for (let i = 0; i < 6; i++) {
			const btn = document.createElement('div');
			btn.style.cssText = `width:${btnW}px;height:${btnH}px;border-radius:2px;background:#1a1a1a;border:1px solid #444;flex-shrink:0;`;
			inputsEl.appendChild(btn);
		}
	}

	function switchTab(bucket) {
		viewportConfigState.activeTab = bucket;
		buckets.forEach(b => {
			if (tabBtns[b]) tabBtns[b].classList.toggle('active', b === bucket);
			if (panels[b]) panels[b].classList.toggle('hidden', b !== bucket);
		});
		renderPreview();
	}
	window.__vpSwitchTabDirect = switchTab;
	buckets.forEach(b => {
		if (tabBtns[b]) tabBtns[b].onclick = () => switchTab(b);
	});

	// The old inline per-tab UI Scale/Sequence Size/Alignment/PiP-Shows dropdowns (and their
	// loadDropdowns()/onchange wiring, and the PiP machine-select populator) lived directly in
	// each panel, above the Configure Viewport button. They've been removed - every real bucket
	// setting now lives only in the Configure Viewport modal below, and PiP machine selection is
	// fixed (not configurable) for these four buckets - see isPipRestrictedBucket().

	const currentBucket = document.body.dataset.viewportBucket;
	switchTab((currentBucket && buckets.includes(currentBucket)) ? currentBucket : 'landscape');

	// Configure modal
	const configModal = document.getElementById('viewport-config-modal');
	const configDoneBtn = document.getElementById('viewport-config-done-btn');
	const configureBtns = document.querySelectorAll('.viewport-configure-btn');

	function renderConfigSettings() {
		const settingsDiv = document.getElementById('viewport-config-settings');
		if (!settingsDiv || !viewportConfigState.configBucket) return;
		const bucket = viewportConfigState.configBucket;
		const profile = appSettings.viewportProfiles[bucket];
		settingsDiv.innerHTML = '';

		// Every control below writes straight to appSettings.viewportProfiles[bucket] and commits
		// immediately - saveState() + a live reapply on the real app + a push into the iframe
		// preview, all in one go. Nothing here is buffered or discardable any more.
		const commit = () => {
			saveState();
			if (typeof applyViewportProfile === 'function') applyViewportProfile();
			renderPreview();
			vpRenderConfigScreen();
		};

		const sectionLabel = (text) => vpMakeSectionLabel(settingsDiv, text);
		const createSlider = (label, key, min, max, step, suffix, fallback) =>
			vpMakeSlider(settingsDiv, profile, commit, label, key, min, max, step, suffix, fallback);
		const createSelect = (label, key, options, defaultVal, isNumeric) =>
			vpMakeSelect(settingsDiv, profile, commit, label, key, options, defaultVal, isNumeric);

		// --- Sizing (all tabs) - dropdowns match the real General settings dropdowns exactly
		// (same option lists, same values) rather than a slider covering the same range, per
		// explicit request: sliders let you land between the real steps, which never matches
		// what the actual General-tab dropdown could produce. ---
		sectionLabel('Sizing');
		createSelect('UI Scale', 'uiScale', vpPercentOptions(50, 500, 10), '100', true);
		createSelect('Sequence Size', 'seqSize', vpPercentOptions(50, 300, 10), '100', true);
		createSelect('Row Max', 'rowMax', [
			{ value: 'none', text: 'None' },
			{ value: '4', text: '4 Cards' }, { value: '5', text: '5 Cards' },
			{ value: '6', text: '6 Cards' }, { value: '7', text: '7 Cards' },
			{ value: '8', text: '8 Cards' }, { value: '10', text: '10 Cards' },
			{ value: '12', text: '12 Cards' }, { value: '15', text: '15 Cards' }
		], profile.rowMax || 'none', false);

		// --- Text & Button Sizing (all tabs) - every bucket has its OWN independent value here,
		// entirely separate from the matching General-tab global setting (landscape and each
		// split bucket are meant to be configured on their own terms; changing General settings
		// never moves these). No "inherit" option - there's always a real per-bucket value. ---
		sectionLabel('Header, Number & Button Sizing');
		createSelect('Header Size', 'headerScale', vpPercentOptions(70, 150, 10), '100', true);
		createSelect('Number Size', 'numberSize', [
			{ value: '100', text: 'Normal' }, { value: '150', text: 'Large' },
			{ value: '200', text: 'Huge' }, { value: '250', text: 'Max (Fill)' }
		], '250', true);
		createSelect('Input Font Size', 'inputFontSize', [
			{ value: '100', text: 'Normal' }, { value: '150', text: 'Large' },
			{ value: '200', text: 'Huge' }, { value: '250', text: 'Max (Fill)' }
		], '100', true);
		createSelect('Button Size', 'btnSize', [
			{ value: '70', text: 'Small' }, { value: '85', text: 'Compact' },
			{ value: '100', text: 'Normal' }, { value: '125', text: 'Large' }, { value: '150', text: 'Huge' }
		], '100', true);

		// --- Header & Inputs Padding (all tabs) - the same two options as the UI tab's Header
		// Padding / Inputs Padding, but this bucket's own independent copy. The UI tab's versions
		// only ever apply to Portrait now (see getEffectiveHeaderPadding/getEffectiveInputsPadding) -
		// every other bucket's padding lives here instead, completely separate from Portrait's. ---
		sectionLabel('Header & Inputs Padding');
		createSelect('Header Padding', 'headerPadding', [
			{ value: '0', text: '0px' }, { value: '8', text: '8px' }, { value: '16', text: '16px' },
			{ value: '24', text: '24px' }, { value: '32', text: '32px' }, { value: '40', text: '40px' }
		], '0', true);
		createSelect('Inputs Padding', 'inputsPadding', [
			{ value: '0', text: '0px' }, { value: '10', text: '10px' }, { value: '20', text: '20px' },
			{ value: '30', text: '30px' }, { value: '40', text: '40px' }, { value: '50', text: '50px' },
			{ value: '60', text: '60px' }, { value: '70', text: '70px' }, { value: '80', text: '80px' }
		], '0', true);

		// --- Adjust Input Area (all tabs, including Landscape - this is the only way to get the
		// correct/usable ratio in Landscape specifically; without it, the input strip falls back
		// to a narrower auto-sizing that leaves buttons too cramped to reliably tap. Portrait has
		// its own separate global-only version of this feature since it isn't part of
		// viewportProfiles. Every bucket here always carries its own
		// inputAreaEnabled/inputAreaPct (see DEFAULT_APP), so this never silently falls back to
		// the global General/UI toggle. ---
		sectionLabel('Adjust Input Area');
		const inputAreaToggleWrap = document.createElement('label');
		inputAreaToggleWrap.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 8px; margin-bottom: 10px; background: #222; border-radius: 4px; cursor: pointer;';
		const inputAreaToggleSpan = document.createElement('span');
		inputAreaToggleSpan.style.cssText = 'color: #ddd; font-size: 11px;';
		inputAreaToggleSpan.textContent = 'Enable draggable divider for this size';
		const inputAreaToggleCb = document.createElement('input');
		inputAreaToggleCb.type = 'checkbox';
		inputAreaToggleCb.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';
		inputAreaToggleCb.checked = !!profile.inputAreaEnabled;
		inputAreaToggleCb.onchange = (e) => {
			profile.inputAreaEnabled = e.target.checked;
			commit();
		};
		inputAreaToggleWrap.appendChild(inputAreaToggleSpan);
		inputAreaToggleWrap.appendChild(inputAreaToggleCb);
		settingsDiv.appendChild(inputAreaToggleWrap);
		createSlider('Input Area Width', 'inputAreaPct', 20, 80, 5, '%', profile.inputAreaPct !== undefined ? profile.inputAreaPct : 50);
		const inputAreaNote = document.createElement('p');
		inputAreaNote.style.cssText = 'color: #666; font-size: 9px; margin: -8px 0 12px;';
		inputAreaNote.textContent = 'Also draggable live on the divider line itself in the preview above.';
		settingsDiv.appendChild(inputAreaNote);

		// --- Layout (split50v/split50h only: alignment) ---
		if (bucket === 'split50v' || bucket === 'split50h') {
			sectionLabel('Layout');
			createSelect('Alignment', 'alignment', [
				{ value: 'horizontal', text: 'Horizontal (Normal)' },
				{ value: 'vertical', text: 'Vertical' }
			], 'horizontal', false);
		}

		// --- Picture-in-Picture (split66/split50v/split50h/split33 only) - fixed behavior, not
		// configurable: Machine 1 always goes in the popup, Machines 2-4 stay in the regular
		// sequence area. Nothing to pick here any more, just an explanation. ---
		if (bucket === 'split66' || bucket === 'split50v' || bucket === 'split50h' || bucket === 'split33') {
			sectionLabel('Picture-in-Picture');
			const note = document.createElement('p');
			note.style.cssText = 'color: #888; font-size: 10px; margin: -2px 0 12px;';
			note.textContent = "Fixed at this size: Machine 1's sequence shows in the PiP popup, Machines 2-4 stay in the regular sequence area.";
			settingsDiv.appendChild(note);
		}

		// --- Header Buttons (split66/split50v/split50h/split33 only - curated set) ---
		if (bucket === 'split66' || bucket === 'split50v' || bucket === 'split50h' || bucket === 'split33') {
			sectionLabel('Header Buttons');
			const note = document.createElement('p');
			note.style.cssText = 'color: #888; font-size: 10px; margin: -2px 0 8px;';
			note.textContent = 'Only these buttons can show at this width. Still gated by each button\'s own General toggle.';
			settingsDiv.appendChild(note);
			const currentSelected = profile.headerButtons || [];
			VP_CURATED_HEADER_BUTTONS.forEach(btnDef => {
				const row = document.createElement('label');
				row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 8px; margin-bottom: 4px; background: #222; border-radius: 4px; cursor: pointer;';
				const span = document.createElement('span');
				span.style.cssText = 'color: #ddd; font-size: 11px;';
				span.textContent = btnDef.label;
				const checkbox = document.createElement('input');
				checkbox.type = 'checkbox';
				checkbox.checked = currentSelected.includes(btnDef.id);
				checkbox.style.cssText = 'width: 16px; height: 16px; cursor: pointer;';
				checkbox.onchange = (e) => {
					let list = (profile.headerButtons || []).slice();
					if (e.target.checked) {
						if (!list.includes(btnDef.id)) list.push(btnDef.id);
					} else {
						list = list.filter(id => id !== btnDef.id);
					}
					profile.headerButtons = list;
					commit();
				};
				row.appendChild(span);
				row.appendChild(checkbox);
				settingsDiv.appendChild(row);
			});
		}

		// --- Infinite scroll reminder (split33 only) ---
		if (bucket === 'split33') {
			const note = document.createElement('p');
			note.style.cssText = 'color: #888; font-size: 10px; margin: 10px 0 0;';
			note.textContent = 'Turn on Infinite Header Scroll (General tab) so scrolling through header buttons works at this width.';
			settingsDiv.appendChild(note);
		}
	}

	function openConfigModal(bucket) {
		viewportConfigState.configBucket = bucket;
		const titleEl = document.getElementById('viewport-config-title');
		if (titleEl) {
			const bucketLabels = { landscape: 'Landscape', split66: '66%', split50v: '50% ↕', split50h: '50% ↔', split33: '33%' };
			titleEl.textContent = 'Configure ' + (bucketLabels[bucket] || bucket);
		}
		renderConfigSettings();
		if (configModal) {
			configModal.classList.remove('opacity-0', 'pointer-events-none');
			configModal.style.opacity = '1';
			configModal.style.pointerEvents = 'auto';
		}
		vpLoadPreviewIframe(bucket);
	}
	window.__vpOpenConfigModalDirect = openConfigModal;

	// Every control commits the instant it changes (see renderConfigSettings' commit()), so
	// closing this modal - by any route - never discards anything. No confirm dialog needed.
	function closeConfigModal() {
		if (configModal) {
			configModal.classList.add('opacity-0', 'pointer-events-none');
			configModal.style.opacity = '0';
			configModal.style.pointerEvents = 'none';
		}
		const iframe = document.getElementById('viewport-config-iframe');
		if (iframe) iframe.src = 'about:blank';
		viewportConfigState.configBucket = null;
	}
	window.__vpCloseConfigModalDirect = closeConfigModal;

	if (configDoneBtn) configDoneBtn.onclick = closeConfigModal;

	configureBtns.forEach(btn => {
		if (!btn) return;
		btn.onclick = () => {
			const bucket = btn.dataset.bucket;
			if (bucket && configModal) openConfigModal(bucket);
		};
	});
}

// --- (Historical note: there used to be a separate compact "mini" modal for split50v/split33 -
// it was removed in favor of routing straight to the accordion tab for the current bucket.)

function openOrientationSettings() {
	const bucket = document.body.dataset.viewportBucket;
	if (modules.settings) modules.settings.openSettings();
	// Every bucket (landscape, 66, 50, 33) gets the same treatment now: open regular Settings,
	// jump straight to the Landscape and Split Screen accordion on the UI tab, and select
	// the tab matching wherever you actually are - no separate special modal, no first-time
	// popup. The accordion/tab UI itself is still exactly how you'd manually reach and adjust
	// these settings; this just saves the navigation when you're already in that orientation.
	if (bucket !== 'landscape' && bucket !== 'split66' && bucket !== 'split50v' && bucket !== 'split50h' && bucket !== 'split33') return;
	setTimeout(() => {
		const uiTabBtn = document.querySelector('[data-tab="ui"]');
		if (uiTabBtn) uiTabBtn.click();
		const accordion = document.getElementById('viewport-accordion');
		if (accordion) accordion.open = true;
		if (typeof initViewportProfilesUI === 'function') initViewportProfilesUI();
		const switchFn = window.__vpSwitchTabDirect;
		if (typeof switchFn === 'function') switchFn(bucket);
		const accordionEl = document.getElementById('viewport-accordion');
		if (accordionEl && accordionEl.scrollIntoView) {
			accordionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, 50);
}
window.openOrientationSettings = openOrientationSettings;

// The actual, reliable cleanup sequence for Nuke - every step genuinely awaited in order, each
// wrapped in its own try/catch so one failure (e.g. no service worker registered) doesn't skip
// the rest. Called directly from the header/settings button now, instead of the old approach of
// doing a rushed, un-awaited fire-and-forget cleanup and then navigating to a URL flag that
// re-ran a SEPARATE, correct copy of this same logic - which required confirming a second,
// easy-to-miss dialog after the page had already reloaded. Missing that second prompt meant
// nothing actually got cleaned up, which is the likely reason this needed repeated attempts.
async function performNuke() {
	try {
		const regs = await navigator.serviceWorker.getRegistrations();
		await Promise.all(regs.map(r => r.unregister()));
	} catch (e) {
		console.warn('Nuke - service worker unregister failed:', e);
	}
	try {
		const names = await caches.keys();
		await Promise.all(names.map(n => caches.delete(n)));
	} catch (e) {
		console.warn('Nuke - cache clear failed:', e);
	}
	try {
		if (window.indexedDB && indexedDB.databases) {
			// Enumerate whatever IndexedDB databases actually exist under this origin, rather
			// than guessing specific names - this app doesn't open any IndexedDB database
			// itself today, but a hardcoded guess-list would silently miss anything a future
			// feature (or a browser/PWA implementation detail) creates.
			const dbs = await indexedDB.databases();
			await Promise.all(dbs.map(db => new Promise((resolve) => {
				if (!db.name) { resolve(); return; }
				const req = indexedDB.deleteDatabase(db.name);
				req.onsuccess = () => resolve();
				req.onerror = () => resolve();
				req.onblocked = () => resolve();
			})));
		}
	} catch (e) {
		console.warn('Nuke - IndexedDB clear failed:', e);
	}
	try {
		localStorage.clear();
	} catch (e) {
		console.warn('Nuke - localStorage clear failed:', e);
	}
	try {
		sessionStorage.clear();
	} catch (e) {
		console.warn('Nuke - sessionStorage clear failed:', e);
	}
	try {
		document.cookie.split(";").forEach((c) => {
			document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
		});
	} catch (e) {
		console.warn('Nuke - cookie clear failed:', e);
	}
}
window.performNuke = performNuke;

// Shared, properly-awaited refresh cleanup - same reasoning as performNuke: the old button
// handler started this cleanup but navigated after a fixed 100ms regardless of whether it had
// actually finished, so on a slower device the reload could beat the real cleanup to the punch.
async function performForceRefresh() {
	try {
		const regs = await navigator.serviceWorker.getRegistrations();
		await Promise.all(regs.map(r => r.unregister()));
	} catch (e) {
		console.warn('Refresh - service worker unregister failed:', e);
	}
	try {
		const names = await caches.keys();
		await Promise.all(names.map(n => caches.delete(n)));
	} catch (e) {
		console.warn('Refresh - cache clear failed:', e);
	}
}
window.performForceRefresh = performForceRefresh;

const startApp = async () => {
	loadState();
	window.appSettings = appSettings;
	// Record this launch's dimensions as an observation immediately - every call to
	// detectViewportBucket() records one too (see vpUpdateObservedExtents), but seeding here
	// means the very first render already has a real observation to work with, not just the
	// last-resort same-session fallback inside vpGetDeviceExtents().
	if (typeof vpUpdateObservedExtents === 'function') vpUpdateObservedExtents();
	if (new URLSearchParams(window.location.search).has('nuke')) {
		history.replaceState(null, '', window.location.pathname);
		if (confirm('☢️ NUKE APP? This will wipe all saved data (settings, sequences, comments), clear browser caches, unregister Service Workers, and force a fresh update from the server. This is the same as the in-app Nuke button, just reachable even if the app won\'t load. Continue?')) {
			await performNuke();
			location.reload();
			return;
		}
	}
	if (new URLSearchParams(window.location.search).has('forceRefresh')) {
		history.replaceState(null, '', window.location.pathname);
		await performForceRefresh();
		if (typeof showToast === 'function') showToast('🔄 Refreshed to the latest version ✅');
	}
	if (new URLSearchParams(window.location.search).has('restoreDefaults')) {
		history.replaceState(null, '', window.location.pathname);
		if (confirm('↩️ Restore all settings to their defaults? This does not touch your saved sequences or comments.')) {
			restoreDefaultSettings();
		}
	}
	document.addEventListener('fullscreenchange', () => {
			document.body.classList.toggle('fullscreen-mode', !!document.fullscreenElement);
			if (typeof triggerRotationRecompute === 'function') triggerRotationRecompute();
	});
	// Pinned Mode and Do Not Disturb never auto-activate on launch, even if they were on when
	// the app was last closed - both have real side effects (kiosk-lock, silencing everything)
	// that shouldn't surprise someone who's just opening the app fresh.
	if (appSettings.isPinnedModeEnabled || appSettings.isDndEnabled) {
		appSettings.isPinnedModeEnabled = false;
		appSettings.isDndEnabled = false;
		saveState();
	}
	if (appSettings.isEcoModeEnabled) document.body.classList.add('eco-mode');
	const headerfullscreenbtn = document.getElementById('headerfullscreenbtn');
	if (headerfullscreenbtn) {
		headerfullscreenbtn.onclick = () => {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen().catch(err => {
						console.warn(`Fullscreen error: ${err.message}`);
				});
				headerfullscreenbtn.classList.add('ring-2', 'ring-emerald-500');
			} else {
				headerfullscreenbtn.classList.remove('ring-2', 'ring-emerald-500');
				releaseFullscreenIfUnused();
			}
		};
	}
	const headerpinnedbtn = document.getElementById('headerpinnedbtn');
	if (headerpinnedbtn) {
		headerpinnedbtn.onclick = async () => {
			const enabling = !appSettings.isPinnedModeEnabled;
			appSettings.isPinnedModeEnabled = enabling;
			if (typeof saveState === 'function') saveState();
			headerpinnedbtn.classList.toggle('ring-2', enabling);
			headerpinnedbtn.classList.toggle('ring-emerald-500', enabling);
			if (enabling) await enterPinnedMode();
			else await exitPinnedMode();
		};
	}
	const headerdndbtn = document.getElementById('headerdndbtn');
	if (headerdndbtn) {
		headerdndbtn.onclick = () => {
			const enabling = !appSettings.isDndEnabled;
			appSettings.isDndEnabled = enabling;
			if (typeof saveState === 'function') saveState();
			headerdndbtn.classList.toggle('ring-2', enabling);
			headerdndbtn.classList.toggle('ring-emerald-500', enabling);
			if (typeof showToast === 'function') showToast(enabling ? 'Do Not Disturb on 🔕' : 'Do Not Disturb off');
		};
	}
	const headerpipbtn = document.getElementById('headerpipbtn');
	if (headerpipbtn) {
		headerpipbtn.onclick = async () => {
			if (document.pictureInPictureElement) {
				await exitPipMode();
				headerpipbtn.classList.remove('ring-2', 'ring-emerald-500');
			} else {
				const ok = await enterPipMode();
				headerpipbtn.classList.toggle('ring-2', ok);
				headerpipbtn.classList.toggle('ring-emerald-500', ok);
			}
		};
	}
	const headerupsidedownbtn = document.getElementById('headerupsidedownbtn');
	if (headerupsidedownbtn) {
		headerupsidedownbtn.onclick = () => {
			const nowOn = document.body.dataset.upsideDown !== '1';
			document.body.dataset.upsideDown = nowOn ? '1' : '0';
			computeAndApplyRotation();
			if (nowOn) {
				headerupsidedownbtn.classList.add('ring-2', 'ring-emerald-500');
				showToast("Upside Down Mode: ON 🙃");
			} else {
				headerupsidedownbtn.classList.remove('ring-2', 'ring-emerald-500');
				showToast("Upside Down Mode: OFF");
			}
		};
	}
	const headerportraitlockbtn = document.getElementById('headerportraitlockbtn');
	if (headerportraitlockbtn) {
		headerportraitlockbtn.onclick = () => {
			if (typeof window.toggleOrientationLock === 'function') window.toggleOrientationLock();
		};
	}
	const headerlandscapelockbtn = document.getElementById('headerlandscapelockbtn');
	if (headerlandscapelockbtn) {
		headerlandscapelockbtn.onclick = () => {
			if (typeof window.toggleLandscapeLock === 'function') window.toggleLandscapeLock();
		};
	}
	const triggerRotationRecompute = () => {
		if (typeof computeAndApplyRotation !== 'function') return;
		computeAndApplyRotation();
		if (typeof applyViewportProfile === 'function') applyViewportProfile();
		if (document.body.classList.contains('layout-swapped') && typeof applyPositionSwapOffsets === 'function') {
			applyPositionSwapOffsets(true);
		}
		if (modules.settings && modules.settings.dom.redeemModal && !modules.settings.dom.redeemModal.classList.contains('opacity-0') && modules.settings.dom.redeemImg) {
			modules.settings.dom.redeemImg.style.transform = getRedeemImageTransform(modules.settings.rScale || 70);
		}
		setTimeout(computeAndApplyRotation, 150);
		setTimeout(computeAndApplyRotation, 400);
		setTimeout(() => { if (typeof applyViewportProfile === 'function') applyViewportProfile(); }, 150);
		setTimeout(() => { if (typeof applyViewportProfile === 'function') applyViewportProfile(); }, 400);
	};
	window.addEventListener('resize', triggerRotationRecompute);
	window.addEventListener('orientationchange', triggerRotationRecompute);
	document.addEventListener('visibilitychange', () => { if (!document.hidden) triggerRotationRecompute(); });
	if (window.screen?.orientation) {
		window.screen.orientation.addEventListener('change', triggerRotationRecompute);
	}
	if (appSettings.isWakeLockEnabled && typeof window.wakelockToggle === 'function') {
		window.wakelockToggle(true);
	}
	if (typeof computeAndApplyRotation === 'function') computeAndApplyRotation();
	if (typeof updatePortraitLockBtnState === 'function') updatePortraitLockBtnState();
	modules.settings = new SettingsManager(appSettings, {
			onSave: () => saveState(),
			onUpdate: () => updateAllChrome(),
			onProfileSwitch: id => {
				if (appSettings.activeProfileId && appSettings.profiles[appSettings.activeProfileId] && appSettings.runtimeSettings) {
					appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings));
				}
				appSettings.activeProfileId = id;
				appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[id].settings));
				saveState();
				renderUI();
			},
			onProfileAdd: name => {
				const id = 'p_' + Date.now();
				appSettings.profiles[id] = {
					name: name,
					settings: JSON.parse(JSON.stringify(DEFAULT_PROFILE_SETTINGS)),
					theme: 'default'
				};
				saveState();
			},
			onProfileRename: name => {
				appSettings.profiles[appSettings.activeProfileId].name = name;
				saveState();
			},
			onProfileDelete: () => {
				if (Object.keys(appSettings.profiles).length > 1) {
					delete appSettings.profiles[appSettings.activeProfileId];
					appSettings.activeProfileId = Object.keys(appSettings.profiles)[0];
					appSettings.runtimeSettings = JSON.parse(JSON.stringify(appSettings.profiles[appSettings.activeProfileId].settings));
					saveState();
					renderUI();
				} else {
					alert("Cannot delete the last profile.");
				}
			},
			onProfileSave: () => {
				appSettings.profiles[appSettings.activeProfileId].settings = JSON.parse(JSON.stringify(appSettings.runtimeSettings));
				saveState();
			},
			onReset: () => {
				localStorage.clear();
				window.location.reload();
			}
	});
	class ToneSequenceTester {
		constructor() {
			this.audioCtx = null;
			this.isPlaying = false;
			this.stopRequested = false;
			this.TONES = Object.fromEntries(TONE_TABLE.map(t => [t.n, t.f]));
		}
		_initAudio() {
			if (!this.audioCtx) {
				this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
			}
		}
		async playTone(frequency, durationMs) {
			this._initAudio();
			if (this.audioCtx.state === 'suspended') await this.audioCtx.resume();
			const oscillator = this.audioCtx.createOscillator();
			const gainNode = this.audioCtx.createGain();
			oscillator.type = 'sine';
			oscillator.frequency.value = frequency;
			const attack = 0.01,
			release = 0.01;
			const durationSec = durationMs / 1000;
			const now = this.audioCtx.currentTime;
			const ecoActive = appSettings.isEcoModeEnabled && appSettings.ecoModeConfig;
			const peakGain = ecoActive ? Math.max(0.05, (appSettings.ecoModeConfig.volumePct || 100) / 100) : 1;
			gainNode.gain.setValueAtTime(0, now);
			gainNode.gain.linearRampToValueAtTime(peakGain, now + attack);
			gainNode.gain.setValueAtTime(peakGain, now + durationSec - release);
			gainNode.gain.linearRampToValueAtTime(0, now + durationSec);
			oscillator.connect(gainNode);
			gainNode.connect(this.audioCtx.destination);
			oscillator.start(now);
			oscillator.stop(now + durationSec);
			return new Promise(resolve => setTimeout(resolve, durationMs));
		}
		async playSequence(sequence, toneDurationMs = 200, silenceDurationMs = 800, onProgress) {
			this.isPlaying = true;
			this.stopRequested = false;
			for (let i = 0; i < sequence.length; i++) {
				if (this.stopRequested) break;
				const num = sequence[i];
				const freq = this.TONES[num];
				if (freq) {
					if (onProgress) onProgress(i, sequence.length, num, freq);
					await this.playTone(freq, toneDurationMs);
					if (this.stopRequested) break;
					if (i < sequence.length - 1) {
						await new Promise(resolve => setTimeout(resolve, silenceDurationMs));
					}
				}
			}
			this.isPlaying = false;
			if (onProgress) onProgress(-1, sequence.length, null, null);
		}
		stop() {
			this.stopRequested = true;
		}
	}
	const toneSequenceTester = new ToneSequenceTester();
	window.toneSequenceTester = toneSequenceTester;
	const toneEngine = new ToneEngine(val => {
			addValue(val);
			showToast(`🎵 Tone: ${val}`);
			const advancedTab = document.getElementById('tab-advanced');
			if (advancedTab && advancedTab.classList.contains('active')) {
				const historyEl = document.getElementById('tone-test-history');
				if (historyEl) {
					historyEl.textContent += (historyEl.textContent ? ", " : "") + val;
				}
			}
		}, debug => {
			const el = document.getElementById('tone-debug-indicator');
			const testEl = document.getElementById('test-tone-readout');
			let text;
			if (debug.error) {
				text = `🎵 Mic error: ${debug.error}`;
			} else if (debug.note) {
				text = `🎵 ${(TONE_TABLE.find(t => t.n === debug.note) || {}).name || '?'} (${debug.freq}Hz) #${debug.note}`;
			} else if (debug.freq) {
				text = `🎵 ${debug.freq}Hz (no note match)`;
			} else {
				text = `🎵 listening...`;
			}
			if (el) el.textContent = text;
			if (testEl) testEl.textContent = text;
	});
	window.toneEngine = toneEngine;
	let handGestureHistory = [];
	let handGestureCooldownUntil = 0;
	if (typeof VisionEngine !== 'function') {
		console.warn('VisionEngine unavailable (wasm/vision_bundle.js not found) - hand tracking disabled.');
		modules.vision = {
			isActive: false,
			start() {
				showToast('Hand tracking unavailable (missing wasm/vision_bundle.js) ❌');
			},
			stop() {}
		};
	} else {
		modules.vision = new VisionEngine(handGestureData => {
				const settings = getProfileSettings();
				if (Date.now() < handGestureCooldownUntil) {
					return;
				}
				if (!handGestureData || handGestureData === "none") {
					return;
				}
				let handGestureId = typeof handGestureData === 'object' ? handGestureData.id : handGestureData;
				if (typeof handGestureId === 'number' && handGestureId >= 0 && handGestureId <= 63 && handGestureId % 2 === 1) {
					handGestureId = handGestureId - 1;
				}
				const handGestureLabel = typeof handGestureData === 'object' ? handGestureData.label : "Gesture";
				const handSide = (typeof handGestureData === 'object' && handGestureData.hand) ? handGestureData.hand : null;
				const handReadout = document.getElementById('test-hand-readout');
				if (handReadout) {
					const sideLabel = handSide === 'L' ? '✋ Left hand' : handSide === 'R' ? '🤚 Right hand' : '';
					handReadout.textContent = `ID ${handGestureId} - ${handGestureLabel}${sideLabel ? ' | ' + sideLabel : ''}`;
				}
				if (window.__testChecklists?.hand) window.__testChecklists.hand.mark(String(handGestureId));
				if (window.__handTestModeActive) return;
				if (appSettings.isHandGesturesEnabled && appSettings.isHandSignalsEnabled) {
					if (handGestureId === 'TWO_HAND_CLEAR') {
						showToast("Hand Signal: Clear 🧹✊✊");
						if (typeof resetCurrentMachine === 'function') resetCurrentMachine();
						handGestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
						return;
					}
					if (handGestureId === 'TWO_HAND_DELETE') {
						showToast("Hand Signal: Delete 🔙👎👎");
						if (typeof handleBackspace === 'function') handleBackspace();
						handGestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
						return;
					}
					if (handGestureId === 'TWO_HAND_PLAY') {
						showToast("Hand Signal: Playing ▶️👍👍");
						playDemo();
						handGestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
						return;
					}
					if (handGestureId === 'TWO_HAND_STOP') {
						isDemoPlaying = false;
						showToast("Hand Signal: Stopped 🛑✋✋");
						handGestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
						return;
					}
				}
				let mappedInput = null;
				if (appSettings.mappings) {
					const detectedHand = (typeof handGestureData === 'object' && handGestureData.hand) ? handGestureData.hand : null;
					for (const [key, mapData] of Object.entries(appSettings.mappings)) {
						const prefix = settings.currentInput === 'key9' ? 'k9_' : settings.currentInput === 'key12' ? 'k12_' : 'piano_';
						if (!key.startsWith(prefix)) continue;
						if (parseInt(mapData.handGesture) !== handGestureId) continue;
						const wantSide = mapData.handSide || 'any';
						if (wantSide !== 'any') {
							if (detectedHand === null) continue;
							if (wantSide !== detectedHand) continue;
						}
						mappedInput = key.replace(prefix, '');
						break;
					}
				}
				if (mappedInput !== null) {
					addValue(mappedInput);
					showToast(`Hand: ${mappedInput} (${handGestureLabel}) 🖐️`);
					document.body.style.backgroundColor = '#222';
					setTimeout(() => document.body.style.backgroundColor = '', 100);
					handGestureCooldownUntil = Date.now() + (appSettings.handGestureCooldown || 2000);
				}
			}, status => showToast(status));
	}
	voiceModule = new VoiceCommander({
			onStatus: msg => showToast(msg),
			onInput: val => {
				addValue(val);
				const btn = document.querySelector(`#pad-${getProfileSettings().currentInput} button[data-value="${val}"]`);
				if (btn) {
					btn.classList.add('flash-active');
					setTimeout(() => btn.classList.remove('flash-active'), 200);
				}
				const hMic = document.getElementById('headervoicebtn');
				if (hMic) {
					hMic.classList.remove('header-btn-active');
					setTimeout(() => {
							if (voiceModule.isListening) hMic.classList.add('header-btn-active');
						}, 300);
				}
			},
			onCommand: cmd => {
				if (!appSettings.isVoiceInputEnabled || !appSettings.isVoiceCommandsEnabled) {
					console.log("Voice commands disabled (Voice Input or Voice Commands is off). Ignoring:", cmd);
					return;
				}
				if (cmd === 'CMD_PLAY') {
					playDemo();
					showToast("Voice: Playing ▶️");
				}
				if (cmd === 'CMD_STOP') {
					isDemoPlaying = false;
					showToast("Voice: Stopped 🛑");
				}
				if (cmd === 'CMD_CLEAR') {
					snapshotForUndo();
					const s = getState();
					s.sequences = Array.from({
							length: CONFIG.MAX_MACHINES
						}, () => []);
					renderUI();
					showToast("Voice: Cleared All 💥");
				}
				if (cmd === 'CMD_DELETE') {
					snapshotForUndo();
					handleBackspace();
					showToast("Voice: Backspace 🔙");
				}
				if (cmd === 'CMD_UNDO') {
					performUndo();
					showToast("Voice: Undo ↩️");
				}
				if (cmd === 'CMD_SETTINGS') {
					modules.settings.openSettings();
				}
				if (cmd === 'CMD_VOLUME_UP') {
					appSettings.runtimeSettings.voiceVolume = Math.min(1.0, (appSettings.runtimeSettings.voiceVolume || 1.0) + 0.1);
					saveState();
					showToast(`Voice: Volume ${(appSettings.runtimeSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
				}
				if (cmd === 'CMD_VOLUME_DOWN') {
					appSettings.runtimeSettings.voiceVolume = Math.max(0.0, (appSettings.runtimeSettings.voiceVolume || 1.0) - 0.1);
					saveState();
					showToast(`Voice: Volume ${(appSettings.runtimeSettings.voiceVolume * 100).toFixed(0)}% 🔊`);
				}
				if (cmd === 'CMD_SPEED_UP') {
					appSettings.runtimeSettings.playbackSpeed = Math.min(2.0, (appSettings.runtimeSettings.playbackSpeed || 1.0) + 0.1);
					saveState();
					showToast(`Voice: Speed ${(appSettings.runtimeSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
				}
				if (cmd === 'CMD_SPEED_DOWN') {
					appSettings.runtimeSettings.playbackSpeed = Math.max(0.5, (appSettings.runtimeSettings.playbackSpeed || 1.0) - 0.1);
					saveState();
					showToast(`Voice: Speed ${(appSettings.runtimeSettings.playbackSpeed * 100).toFixed(0)}% 🐇`);
				}
			}
	});
	window.voiceModule = voiceModule;
	if (appSettings.isRandomThemeEnabled) {
		const allThemeKeys = [...Object.keys(PREMADE_THEMES), ...Object.keys(appSettings.customThemes || ({}))];
		if (allThemeKeys.length > 0) {
			appSettings.activeTheme = allThemeKeys[Math.floor(Math.random() * allThemeKeys.length)];
		}
	}
	updateAllChrome();
	if (typeof applyViewportProfile === 'function') applyViewportProfile();
	initFirebaseAndComments();
	modules.settings.updateHeaderVisibility();
	initGlobalListeners();
	if (typeof window.updateAmbientSensorState === 'function') window.updateAmbientSensorState(true);
	if (typeof window.updateProximitySensorState === 'function') window.updateProximitySensorState(true);
	initTouchGestureEngine();
	setupARLogic();
	wireHeaderButtonInteractions();
	initViewportProfilesUI();
	if (appSettings.isEcoModeEnabled && typeof modules.settings.applyEcoModeConfig === 'function') modules.settings.applyEcoModeConfig();
	renderUI();
	if (new URLSearchParams(window.location.search).has('openHelp')) {
		history.replaceState(null, '', window.location.pathname);
		modules.settings.closeSetup();
		modules.settings.generatePrompt();
		if (modules.settings.dom.helpModal) modules.settings.dom.helpModal.classList.remove('opacity-0', 'pointer-events-none');
		if (window.lockBodyScroll) window.lockBodyScroll();
	}
};
(function initRealViewportHeight() {
	const footer = document.getElementById('input-footer');
	const apply = () => {
		const vv = window.visualViewport;
		const h = (vv && vv.height) || window.innerHeight;
		const w = (vv && vv.width) || window.innerWidth;
		document.documentElement.style.setProperty('--real-vh', h + 'px');
		document.documentElement.style.setProperty('--real-vw', w + 'px');
		if (vv && footer && !document.body.classList.contains('layout-swapped')) {
			const offset = window.innerHeight - vv.height - vv.offsetTop;
			footer.style.bottom = Math.max(0, offset) + 'px';
		}
	};

	apply();

	// Re-apply measurements when data-rotate changes (e.g. toggling Portrait Lock),
	// which doesn't fire a native resize event on its own.
	const obs = new MutationObserver(apply);
	obs.observe(document.body, { attributes: true, attributeFilter: ['data-rotate'] });

	if (window.visualViewport) {
		window.visualViewport.addEventListener('resize', apply);
		window.visualViewport.addEventListener('scroll', apply);
	}
	window.addEventListener('resize', apply);
	window.addEventListener('orientationchange', () => setTimeout(apply, 150));
})();
document.addEventListener('DOMContentLoaded', startApp);
if ('serviceWorker' in navigator && !location.search.includes('vpPreview=1')) {
	window.addEventListener('load', () => {
			navigator.serviceWorker.register('./sw.js').then(reg => {
					reg.update().catch(() => {});
			}).catch(err => {
					console.warn('[SW] Registration failed:', err);
			});
	});
}

