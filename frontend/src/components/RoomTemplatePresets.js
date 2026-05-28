// Room template presets with DIFFERENT products for each bathroom
// Using specific product keywords that match actual database products
// Essential items: Basin + Faucet + Mirror for basin area, Toilet + Flush for WC area, ALL shower products for shower area

export const roomTemplatePresets = {
  'Master Bathroom': {
    areas: [
      {
        id: 'shower',
        name: 'Shower Area',
        icon: '🚿',
        suggestedProducts: ['Rain Shower', 'Hand Shower', 'Shower Mixer', 'Diverter'],
        defaultProducts: [
          { keyword: 'Organic multi-mode showerhead with shower arm', quantity: 1, essential: true },
          { keyword: 'Round three-function handshower', quantity: 1, essential: true },
          { keyword: 'Recessed bath and shower trim with diverter', quantity: 1, essential: true },
          { keyword: 'Exposed Thermostatic Bath & Shower Mixer', quantity: 1, essential: true }
        ]
      },
      {
        id: 'basin',
        name: 'Basin Area',
        icon: '🪣',
        suggestedProducts: ['Table Top Basin', 'Basin Mixer', 'LED Mirror'],
        defaultProducts: [
          { keyword: '600mm edge decorative vessel basin without faucet hole in french gold', quantity: 1, essential: true },
          { keyword: 'Single-control tall basin faucet in french gold', quantity: 1, essential: true },
          { keyword: '1016mm perimeter lighted mirror', quantity: 1, essential: true },
          { keyword: 'Wall Hung Integrated Basin', quantity: 1, essential: true }
        ]
      },
      {
        id: 'wc',
        name: 'WC Area',
        icon: '🚽',
        suggestedProducts: ['One Piece WC', 'Flush Plate'],
        defaultProducts: [
          { keyword: 'Wall hung intelligent toilet with remote', quantity: 1, essential: true },
          { keyword: 'Pneumatic faceplate in french gold', quantity: 1, essential: true },
          { keyword: 'Bidspa Rimless Wall Hung WC', quantity: 1, essential: true }
        ]
      },
      {
        id: 'bathtub',
        name: 'Bathtub Area',
        icon: '🛁',
        suggestedProducts: ['Bathtub', 'Bath Spout', 'Bath Mixer'],
        defaultProducts: []
      }
    ]
  },
  'Parents Bathroom': {
    areas: [
      {
        id: 'shower',
        name: 'Shower Area',
        icon: '🚿',
        suggestedProducts: ['Rain Shower', 'Hand Shower', 'Shower Mixer'],
        defaultProducts: [
          { keyword: 'Square showerhead with shower arm', quantity: 1, essential: true },
          { keyword: 'Single function large hand shower with hose', quantity: 1, essential: true },
          { keyword: 'Recessed bath and shower AT235 trim', quantity: 1, essential: true },
          { keyword: 'Exposed Thermostatic Bath & Shower Mixer', quantity: 1, essential: true }
        ]
      },
      {
        id: 'basin',
        name: 'Basin Area',
        icon: '🪣',
        suggestedProducts: ['Table Top Basin', 'Basin Mixer', 'LED Mirror'],
        defaultProducts: [
          { keyword: '600mm edge vessel basin without faucet hole in honed black', quantity: 1, essential: true },
          { keyword: 'Wall mount single-control basin faucet trim with valve in french gold', quantity: 1, essential: true },
          { keyword: '762mm x 1016mm column lighted lite mirror', quantity: 1, essential: true },
          { keyword: 'Thin Rim Table Top Basin', quantity: 1, essential: true }
        ]
      },
      {
        id: 'wc',
        name: 'WC Area',
        icon: '🚽',
        suggestedProducts: ['One Piece WC', 'Flush Plate'],
        defaultProducts: [
          { keyword: 'Wall hung toilet with Quiet-Close™ UF seat cover in peacock', quantity: 1, essential: true },
          { keyword: 'Pneumatic faceplate in rose gold', quantity: 1, essential: true },
          { keyword: 'Rimless, Blind Installation Wall Hung WC', quantity: 1, essential: true }
        ]
      }
    ]
  },
  'Children Bathroom': {
    areas: [
      {
        id: 'shower',
        name: 'Shower Area',
        icon: '🚿',
        suggestedProducts: ['Hand Shower', 'Shower Mixer'],
        defaultProducts: [
          { keyword: 'Organic multi-mode showerhead with shower arm', quantity: 1, essential: true },
          { keyword: 'Single function hand shower with hose in polished chrome', quantity: 1, essential: true },
          { keyword: 'Recessed bath and shower AT230 trim', quantity: 1, essential: true }
        ]
      },
      {
        id: 'basin',
        name: 'Basin Area',
        icon: '🪣',
        suggestedProducts: ['Wall Hung Basin', 'Basin Mixer', 'Mirror'],
        defaultProducts: [
          { keyword: '410mm round vessel basin without faucet hole', quantity: 1, essential: true },
          { keyword: 'Single-control wall mount basin faucet trim in polished chrome', quantity: 1, essential: true },
          { keyword: '510mm x 1018mm capsule lighted mirror', quantity: 1, essential: true },
          { keyword: 'Counter Top Basin', quantity: 1, essential: true }
        ]
      },
      {
        id: 'wc',
        name: 'WC Area',
        icon: '🚽',
        suggestedProducts: ['Two Piece WC', 'Flush Tank'],
        defaultProducts: [
          { keyword: 'One-piece toilet with Quiet-Close™  seat cover in white', quantity: 1, essential: true },
          { keyword: 'Pneumatic faceplate in white with actuation button', quantity: 1, essential: true },
          { keyword: 'Rimless Bowl with Cistern For Coupled WC', quantity: 1, essential: true }
        ]
      }
    ]
  },
  'Powder Bathroom': {
    areas: [
      {
        id: 'basin',
        name: 'Basin Area',
        icon: '🪣',
        suggestedProducts: ['Wall Hung Basin', 'Basin Mixer', 'Mirror'],
        defaultProducts: [
          { keyword: '568mm vessel basin with single faucet hole', quantity: 1, essential: true },
          { keyword: 'Single-control tall basin faucet without drain', quantity: 1, essential: true },
          { keyword: '866mm x 762mm two-door lighted mirrored cabinet', quantity: 1, essential: true },
          { keyword: 'Table Top Basin, (Jaguar)', quantity: 1, essential: true }
        ]
      },
      {
        id: 'wc',
        name: 'WC Area',
        icon: '🚽',
        suggestedProducts: ['Wall Hung WC', 'Flush Plate'],
        defaultProducts: [
          { keyword: 'Wall hung toilet with Quiet-Close™  slim seat cover in black', quantity: 1, essential: true },
          { keyword: 'Mechanical faceplate in brushed bronze', quantity: 1, essential: true },
          { keyword: 'Bidspa Single Piece WC', quantity: 1, essential: true }
        ]
      }
    ]
  },
  'Powder Toilet': {
    areas: [
      {
        id: 'basin',
        name: 'Basin Area',
        icon: '🪣',
        suggestedProducts: ['Wall Hung Basin', 'Pillar Cock', 'Mirror'],
        defaultProducts: [
          { keyword: '450mm wall mount basin with single faucet hole', quantity: 1, essential: true },
          { keyword: 'Single control wall mount basin faucet trim in polished chrome', quantity: 1, essential: true },
          { keyword: 'Premium XL 405mm x 914mm capsule mirror cabinet', quantity: 1, essential: true },
          { keyword: 'Urinal with Fixing Accessories', quantity: 1, essential: true }
        ]
      },
      {
        id: 'wc',
        name: 'WC Area',
        icon: '🚽',
        suggestedProducts: ['Wall Hung WC', 'Flush Plate'],
        defaultProducts: [
          { keyword: 'Rimless wall hung toilet with Quiet-Close', quantity: 1, essential: true },
          { keyword: 'Pneumatic faceplate in black with actuation button in brushed nickel', quantity: 1, essential: true },
          { keyword: 'Bidspa Rimless Wall Hung WC', quantity: 1, essential: true }
        ]
      }
    ]
  },
  'Children Toilet': {
    areas: [
      {
        id: 'basin',
        name: 'Basin Area',
        icon: '🪣',
        suggestedProducts: ['Wall Hung Basin', 'Basin Mixer', 'Mirror'],
        defaultProducts: [
          { keyword: '600mm edge vessel basin without faucet hole in white', quantity: 1, essential: true },
          { keyword: 'Single-control wall mount monoblock basin faucet trim + valve', quantity: 1, essential: true },
          { keyword: '610mm X 1675mm arch floor mirror', quantity: 1, essential: true },
          { keyword: 'Counter Top Basin', quantity: 1, essential: true }
        ]
      },
      {
        id: 'wc',
        name: 'WC Area',
        icon: '🚽',
        suggestedProducts: ['Two Piece WC', 'Flush Tank'],
        defaultProducts: [
          { keyword: 'One-piece elongated smart toilet, dual-flush', quantity: 1, essential: true },
          { keyword: 'Pneumatic flush valve', quantity: 1, essential: true },
          { keyword: 'Rimless Bowl with Cistern For Coupled WC', quantity: 1, essential: true }
        ]
      }
    ]
  },
  'Kitchen': {
    areas: [
      {
        id: 'sink',
        name: 'Sink Area',
        icon: '🚰',
        suggestedProducts: ['Kitchen Sink', 'Sink Mixer'],
        defaultProducts: []
      },
      {
        id: 'countertop',
        name: 'Countertop Area',
        icon: '🔲',
        suggestedProducts: ['Countertop', 'Backsplash Tiles'],
        defaultProducts: []
      }
    ]
  }
};
