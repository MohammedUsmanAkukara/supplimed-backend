async function updateViaApi() {
  try {
    console.log('[API Updater] Logging in as admin...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@supplimed.in',
        password: 'SupplimedAdmin2026!'
      })
    });

    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.token) {
      console.error('[API Updater] Login failed:', loginData);
      return;
    }
    const token = loginData.token;
    console.log('[API Updater] Logged in successfully. Fetching products...');

    // 1. Get all products
    const prodRes = await fetch('http://localhost:5000/api/products?limit=50');
    const prodData = await prodRes.json();
    const products = prodData.products || [];

    const imageMap = {
      'hemovac-plus-k2edta-k3edta': {
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg', '/images/hero-lab.jpg']
      },
      'hemovac-plus-fluoride': {
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/rd-lab.jpg']
      },
      'hemo-tube-clot-activator': {
        featuredImage: '/images/tubes.jpg',
        images: ['/images/tubes.jpg', '/images/cleanroom.jpg']
      },
      'hemo-porter-cool-case': {
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/hero-lab.jpg']
      },
      'hemovac-plus-urine-container': {
        featuredImage: '/images/hemo-porter.jpg',
        images: ['/images/hemo-porter.jpg', '/images/centrifuge.jpg']
      },
      'centrifuge-tubes-15ml-50ml': {
        featuredImage: '/images/centrifuge.jpg',
        images: ['/images/centrifuge.jpg', '/images/rd-lab.jpg']
      }
    };

    for (const p of products) {
      const match = imageMap[p.slug];
      if (match) {
        console.log(`[API Updater] Updating product ${p.name} (${p._id})...`);
        const updateRes = await fetch(`http://localhost:5000/api/products/admin/${p._id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            featuredImage: match.featuredImage,
            images: match.images
          })
        });
        const updateData = await updateRes.json();
        console.log(`[API Updater] Result for ${p.slug}:`, updateData.success ? 'Success' : updateData.message);
      }
    }

    // 2. Update home and about pages via page admin endpoint if available
    const pagesRes = await fetch('http://localhost:5000/api/pages/admin/all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (pagesRes.ok) {
      const pagesData = await pagesRes.json();
      for (const pg of (pagesData.pages || [])) {
        if (pg.slug === 'home') {
          await fetch(`http://localhost:5000/api/pages/admin/${pg._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              heroImage: '/images/hero-lab.jpg',
              featuredImage: '/images/cleanroom.jpg'
            })
          });
          console.log('[API Updater] Updated Home page via API.');
        } else if (pg.slug === 'about') {
          await fetch(`http://localhost:5000/api/pages/admin/${pg._id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              heroImage: '/images/cleanroom.jpg',
              featuredImage: '/images/rd-lab.jpg'
            })
          });
          console.log('[API Updater] Updated About page via API.');
        }
      }
    }

    console.log('[API Updater] Completed all API updates successfully!');
  } catch (err) {
    console.error('[API Updater] Error:', err);
  }
}

updateViaApi();
