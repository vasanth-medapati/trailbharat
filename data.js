// ═══════════════════════════════════════════════════════
// TRAILBHARAT — INDIA MASTER DATA (MULTI-STATE)
// Gujarat + Delhi-Noida + Kerala + AP + Karnataka
// Scalable unified structure
// ═══════════════════════════════════════════════════════

export const INDIA_DATA = {

  // ─────────────────────────────────────────────────────
  // GUJARAT
  // ─────────────────────────────────────────────────────
  gujarat: {
    sites: [
      {
        id:'statue-of-unity', name:'Statue of Unity', type:'heritage',
        city:'Kevadia', lat:21.8380, lng:73.7191,
        rating:4.8, reviews:52000,
        desc:'World’s tallest statue dedicated to Sardar Patel.',
        tags:['monument']
      },
      {
        id:'somnath', name:'Somnath Temple', type:'temple',
        city:'Somnath', lat:20.8880, lng:70.4012,
        rating:4.9,
        desc:'First Jyotirlinga temple.'
      },
      {
        id:'dwarka', name:'Dwarkadhish Temple', type:'temple',
        city:'Dwarka', lat:22.2442, lng:68.9685,
        desc:'Char Dham pilgrimage site.'
      },
      {
        id:'gir', name:'Gir National Park', type:'nature',
        city:'Junagadh', lat:21.1240, lng:70.8240,
        desc:'Only Asiatic lion habitat.'
      },
      {
        id:'rann-kutch', name:'Rann of Kutch', type:'nature',
        city:'Kutch', lat:23.7337, lng:69.8597,
        desc:'White salt desert.'
      },
      {
        id:'dholavira', name:'Dholavira', type:'heritage',
        city:'Kutch', lat:23.8850, lng:70.2150,
        desc:'Harappan site.'
      }
    ],

    treks: [
      {
        id:'saputara-trail', name:'Saputara Hill Trail',
        distance:'5km', difficulty:'Easy',
        desc:'Only hill station trekking zone in Gujarat.'
      }
    ]
  },

  // ─────────────────────────────────────────────────────
  // DELHI + NOIDA
  // ─────────────────────────────────────────────────────
  delhi_noida: {
    sites: [
      {
        id:'india-gate', name:'India Gate', type:'heritage',
        city:'Delhi', lat:28.6129, lng:77.2295,
        desc:'War memorial.'
      },
      {
        id:'red-fort', name:'Red Fort', type:'heritage',
        city:'Delhi', lat:28.6562, lng:77.2410,
        desc:'UNESCO Mughal fort.'
      },
      {
        id:'qutub-minar', name:'Qutub Minar', type:'heritage',
        city:'Delhi', lat:28.5245, lng:77.1855,
        desc:'Tallest brick minaret.'
      },
      {
        id:'lotus-temple', name:'Lotus Temple',
        city:'Delhi', lat:28.5535, lng:77.2588,
        desc:'Bahai temple.'
      },
      {
        id:'akshardham-delhi', name:'Akshardham Delhi',
        city:'Delhi', lat:28.6127, lng:77.2773,
        desc:'Massive temple complex.'
      },
      {
        id:'okhla-bird', name:'Okhla Bird Sanctuary',
        city:'Noida', lat:28.5616, lng:77.3106,
        desc:'Wetland sanctuary.'
      }
    ],

    treks: [
      {
        id:'delhi-heritage-walk',
        name:'Old Delhi Walk',
        distance:'4km',
        difficulty:'Easy'
      }
    ]
  },

  // ─────────────────────────────────────────────────────
  // KERALA
  // ─────────────────────────────────────────────────────
  kerala: {
    sites: [
      {
        id:'munnar', name:'Munnar', type:'nature',
        city:'Idukki', lat:10.0889, lng:77.0595,
        desc:'Tea plantation hills.'
      },
      {
        id:'alleppey', name:'Alleppey Backwaters',
        city:'Alappuzha', lat:9.4981, lng:76.3388,
        desc:'Houseboat destination.'
      },
      {
        id:'wayanad', name:'Wayanad',
        city:'Wayanad', lat:11.6854, lng:76.1320,
        desc:'Forest and waterfalls.'
      },
      {
        id:'varkala', name:'Varkala Cliff',
        city:'Varkala', lat:8.7379, lng:76.7163,
        desc:'Cliff beach.'
      },
      {
        id:'kovalam', name:'Kovalam Beach',
        city:'Trivandrum', lat:8.4000, lng:76.9780,
        desc:'Famous beach.'
      },
      {
        id:'kochi', name:'Fort Kochi',
        city:'Kochi', lat:9.9654, lng:76.2425,
        desc:'Colonial heritage.'
      }
    ],

    treks: [
      {
        id:'wayanad-trek',
        name:'Wayanad Forest Trek',
        distance:'8km',
        difficulty:'Moderate'
      }
    ]
  },

  // ─────────────────────────────────────────────────────
  // ANDHRA PRADESH
  // ─────────────────────────────────────────────────────
  andhra_pradesh: {
    sites: [
      {
        id:'tirupati', name:'Tirupati Temple',
        city:'Tirupati', lat:13.6288, lng:79.4192,
        desc:'Richest temple in India.'
      },
      {
        id:'araku', name:'Araku Valley',
        city:'Vizag', lat:18.3270, lng:82.8800,
        desc:'Hill station.'
      },
      {
        id:'borra-caves', name:'Borra Caves',
        city:'Vizag', lat:18.2797, lng:82.6987,
        desc:'Limestone caves.'
      },
      {
        id:'rk-beach', name:'RK Beach',
        city:'Vizag', lat:17.6868, lng:83.2185,
        desc:'Popular beach.'
      },
      {
        id:'amaravati', name:'Amaravati',
        city:'Amaravati', lat:16.5714, lng:80.3575,
        desc:'Buddhist site.'
      }
    ],

    treks: [
      {
        id:'araku-trek',
        name:'Araku Valley Trail',
        distance:'6km',
        difficulty:'Moderate'
      }
    ]
  },

  // ─────────────────────────────────────────────────────
  // KARNATAKA
  // ─────────────────────────────────────────────────────
  karnataka: {
    sites: [
      {
        id:'hampi', name:'Hampi',
        city:'Hampi', lat:15.3350, lng:76.4600,
        desc:'UNESCO ruins.'
      },
      {
        id:'mysore-palace', name:'Mysore Palace',
        city:'Mysore', lat:12.3052, lng:76.6552,
        desc:'Royal palace.'
      },
      {
        id:'coorg', name:'Coorg',
        city:'Kodagu', lat:12.3375, lng:75.8069,
        desc:'Coffee hills.'
      },
      {
        id:'gokarna', name:'Gokarna Beach',
        city:'Gokarna', lat:14.5479, lng:74.3188,
        desc:'Beach town.'
      },
      {
        id:'bangalore', name:'Bangalore',
        city:'Bangalore', lat:12.9716, lng:77.5946,
        desc:'Tech capital.'
      }
    ],

    treks: [
      {
        id:'coorg-trek',
        name:'Coorg Hill Trek',
        distance:'10km',
        difficulty:'Moderate'
      }
    ]
  }
};
