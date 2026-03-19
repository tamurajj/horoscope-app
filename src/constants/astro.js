export const ASPECTS = {
  conjunction: { angle: 0,   orb: 8 },
  opposition:  { angle: 180, orb: 8 },
  trine:       { angle: 120, orb: 6 },
  square:      { angle: 90,  orb: 6 },
  sextile:     { angle: 60,  orb: 4 },
}

export const SIGNS = [
  '牡羊座', '牡牛座', '双子座', '蟹座',
  '獅子座', '乙女座', '天秤座', '蠍座',
  '射手座', '山羊座', '水瓶座', '魚座',
]

export const PLANETS = [
  'sun', 'moon', 'mercury', 'venus', 'mars',
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'northNode', 'southNode',
]

export const PLANET_LABELS = {
  sun:       '太陽',
  moon:      '月',
  mercury:   '水星',
  venus:     '金星',
  mars:      '火星',
  jupiter:   '木星',
  saturn:    '土星',
  uranus:    '天王星',
  neptune:   '海王星',
  pluto:     '冥王星',
  northNode: 'ノード',
  southNode: 'サウスノード',
}

export const HOUSE_SYSTEMS = {
  equal:     'イコールハウス',
  wholesign: 'ホールサインハウス',
  koch:      'コッホ',
}