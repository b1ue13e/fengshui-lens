export const riskActionMap: Record<string, string[]> = {
  // 西晒相关
  west_sun_bedroom: ['blackout_curtain', 'window_film', 'reposition_bed'],
  west_sun_wfh: ['window_film', 'blackout_curtain', 'reposition_desk'],
  
  // 采光相关
  window_blocked: ['supplemental_light', 'light_color_paint'],
  low_floor_light: ['supplemental_light'],
  
  // 噪音相关
  street_noise: ['seal_strip', 'thick_curtain', 'white_noise'],
  elevator_noise: ['white_noise', 'earplugs'],
  old_building_noise: ['rug_carpet', 'white_noise'],
  
  // 潮湿相关
  poor_ventilation: ['ventilation_fan', 'dehumidifier'],
  damp_signs: ['dehumidifier', 'moisture_absorber', 'ventilation_fan'],
  ground_floor_damp: ['dehumidifier', 'moisture_absorber'],
  
  // 隐私相关
  bed_privacy: ['curtain_door', 'room_divider', 'reposition_bed'],
  shared_privacy: ['room_divider', 'curtain_door'],
  
  // 专注相关
  no_desk_space: ['folding_desk', 'room_divider'],
  desk_back_window: ['desk_lamp', 'reposition_desk'],
  
  // 老人安全相关
  no_elevator: ['add_handrail', 'anti_slip'],
  low_floor_damp: ['dehumidifier', 'anti_slip'],
};