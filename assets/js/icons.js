/* 
   Premium Icon System
   Uses vector paths for crisp rendering at any scale.
*/

export const getNavIcon = (name, isActive = false) => {
    const color = isActive ? '#FFC000' : 'currentColor';
    const fill = isActive ? 'rgba(255, 192, 0, 0.2)' : 'none'; // Subtle fill for active

    // Premium Phosphor/Lucide style paths
    const paths = {
        'Home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
        'Bank': '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>', // Archive/Bank look
        'Generate': '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>',
        'Templates': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>',
        'Profile': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>'
    };

    const path = paths[name] || paths['Home'];

    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px; display: block; margin: 0 auto;">
            ${path}
        </svg>
    `;
};

export const getSubjectIcon = (subjectName) => {
    const color = getSubjectColor(subjectName);
    const path = getSubjectPath(subjectName);

    return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="subject-svg-icon" style="color: ${color}; width: 24px; height: 24px;">
            ${path}
        </svg>
    `;
};

export const getSubjectColor = (subjectName) => {
    const colors = {
        'Physics': '#3B82F6', // Blue
        'Chemistry': '#EF4444', // Red
        'Mathematics': '#8B5CF6', // Purple
        'Maths': '#8B5CF6',
        'Biology': '#10B981', // Green
        'English': '#F59E0B', // Orange
        'Computer': '#6366F1', // Indigo
        'History': '#78350F', // Brown
        'Geography': '#059669', // Teal
        'Telugu': '#D946EF', // Magenta
        'Hindi': '#F97316', // Orange Red
        'Social': '#14B8A6', // Cyan
        'EVS': '#84CC16', // Lime
        'Science': '#0EA5E9' // Sky Blue
    };

    // Default fallback
    if (colors[subjectName]) return colors[subjectName];

    // Hash generator for stable random colors
    const defaults = ['#6B7280', '#EC4899', '#14B8A6', '#F97316'];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
        hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return defaults[Math.abs(hash) % defaults.length];
};

const getSubjectPath = (subjectName) => {
    const name = subjectName.toLowerCase();

    // Physics - Atomish
    if (name.includes('physics')) {
        return '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5a4 4 0 1 1 5.6 5.6"></path>'; // Simplified Abstract Atom
        // Alternative Atom: Ellipses are hard in basic geometric paths without complex arcs.
        // Let's use a Magnet or Bolt? 
        // Bolt: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>'; // Shield/Atom-like container? No, let's stick to Bolt for energy/physics
    }

    // Chemistry - Flask
    if (name.includes('chemistry')) {
        return '<path d="M10 2v7.31L6 19.55a2 2 0 0 0 1.76 2.45h8.48a2 2 0 0 0 1.76-2.45L14 9.31V2"></path><path d="M8 2h8"></path><path d="M9 14h6"></path>';
    }

    // Maths - Calculator or Ruler/Pi
    if (name.includes('math')) {
        return '<rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path>';
    }

    // Biology - Leaf or DNA
    if (name.includes('biology')) {
        // Leaf
        return '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 1.45 10a7 7 0 0 1-9.45 8z"></path>';
    }

    // English - Book
    if (name.includes('english')) {
        return '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>';
    }

    // Telugu - Book with 'T' logic or just Book (generic)
    if (name.includes('telugu')) {
        // Glyph-like abstract
        return '<circle cx="12" cy="12" r="10"></circle><path d="M9 12a3 3 0 1 0 6 0"></path><path d="M9 12v3"></path>';
    }

    // Hindi - Book with 'H' logic or Om?
    if (name.includes('hindi')) {
        // Devanagari-ish abstract line
        return '<path d="M4 6h16"></path><path d="M12 6v10"></path><path d="M8 12a4 4 0 0 0 8 0"></path>';
    }

    // Social - Globe
    if (name.includes('social')) {
        return '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>';
    }

    // EVS - Nature / Sun & Cloud
    if (name.includes('evs')) {
        return '<path d="M17 18a5 5 0 0 0-10 0"></path><line x1="12" y1="9" x2="12" y2="2"></line><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"></line><line x1="1" y1="18" x2="3" y2="18"></line><line x1="21" y1="18" x2="23" y2="18"></line><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"></line><line x1="23" y1="22" x2="1" y2="22"></line><polyline points="16 5 12 9 8 5"></polyline>';
    }

    // Science - Microscope or Atom (if Physics is Bolt)
    if (name.includes('science')) {
        // Microscope
        // return '<path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0 0-14h-1"></path><rect x="9" y="14" width="4" height="4"></rect><path d="M9 8H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2 3 3 0 0 1 3 3"></path>';
        // Atom (Simple 3 rings)
        return '<circle cx="12" cy="12" r="3"></circle><path d="M12 2a10 10 0 0 0 0 20"></path><path d="M2.5 12a10 10 0 0 0 19 0"></path><path d="M4.93 4.93a10 10 0 0 0 14.14 14.14"></path><path d="M19.07 4.93a10 10 0 0 0-14.14 14.14"></path>';
    }

    // Computer
    if (name.includes('computer')) {
        return '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line>';
    }

    // History
    if (name.includes('history')) {
        // Hourglass or Column
        // Column:
        return '<path d="M6 22V2h12v20"></path><path d="M6 6H2v12h4"></path><path d="M18 6h4v12h-4"></path><path d="M6 10h12"></path><path d="M6 14h12"></path>';
    }

    // Geography -> Map
    if (name.includes('geography')) {
        return '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line>';
    }

    // Default - Folder
    return '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>';
};
