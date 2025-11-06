/**
 * DATA: gameContent
 * Contenido estático para los módulos de juego
 * Basado exactamente en Game.tsx - Virtual Knockout
 */

export const JUGABILIDAD_CONTENT = {
    title: "EL RING TE ESPERA",
    subtitle: "¿TIENES LO NECESARIO?",
    description: "Entra al ring más desafiante del mundo virtual. Solo los valientes se atreven a enfrentar el combate definitivo.",
    
    sections: [
        {
            title: "¿En qué consiste?",
            items: [
                {
                    icon: "🥊",
                    highlight: "Enfréntate a oponentes desafiantes",
                    text: "en un combate VR visceral."
                },
                {
                    icon: "�",
                    highlight: "Suda de verdad",
                    text: "con un sistema de juego físicamente activo."
                },
                {
                    icon: "🏆",
                    highlight: "Conquista el cinturón",
                    text: "y conviértete en el campeón definitivo."
                }
            ]
        },
        {
            title: "Objetivo",
            description: "Derrota a tu oponente usando combinaciones de golpes, movimientos defensivos y estrategia de combate. Tu misión es simple: ",
            highlight: "¡Knockearlo antes de que él te knockee a ti!"
        },
        {
            title: "¿Listo para sudar, esquivar y golpear como un campeón?",
            features: [
                {
                    icon: "⚡",
                    title: "Combate Rápido",
                    description: "Esquiva y contraataca en tiempo real."
                },
                {
                    icon: "💥",
                    title: "Knockout Épico",
                    description: "Busca la oportunidad perfecta para el KO."
                },
                {
                    icon: "🥊",
                    title: "Técnicas de Boxeo",
                    description: "Jabs, ganchos y uppercuts virtuales."
                },
                {
                    icon: "🏆",
                    title: "Campeón Invicto",
                    description: "Mantente como el último en pie."
                }
            ]
        }
    ],
    
    gallery: {
        images: []
    }
};

export const PROGRESO_CONTENT = {
    title: "DESARROLLO DEL PROYECTO",
    subtitle: "Del concepto a la realidad",
    
    timeline: [
        {
            id: 1,
            phase: "La Idea",
            date: "Fase 1",
            description: "Crear un juego de boxeo VR donde el jugador se enfrenta mano a mano contra un oponente virtual hasta conseguir el knockout",
            highlights: [],
            media: [
                { type: 'image', url: 'images/sketch.png', alt: 'Sketch conceptual' },
                { type: 'image', url: 'images/sketch1.png', alt: 'Sketch conceptual 2' }
            ]
        },
        {
            id: 2,
            phase: "Sketching",
            date: "Fase 2",
            description: "Diseñamos la mecánica de combate: sistema de golpes, defensa, vida del oponente y animación de knockout",
            highlights: [],
            media: [
                { type: 'image', url: 'images/sketch3.png', alt: 'Sketch de mecánicas' },
                { type: 'image', url: 'images/sketch1.png', alt: 'Sketch conceptual 2' }
            ]
        },
        {
            id: 3,
            phase: "Prototipo",
            date: "Fase 3",
            description: "Recibimos feedback y modificamos la mecánica para mejorar la experiencia de juego",
            highlights: [],
            media: [
                { type: 'video', youtubeId: 'QMEVDcjxyuA', alt: 'Demo del prototipo 1' },
                { type: 'video', youtubeId: 'FZopgnWH78I', alt: 'Demo del prototipo 2' }
            ]
        }
    ],
    
    metrics: null
};

export const COMUNIDAD_CONTENT = {
    title: "NUESTRO EQUIPO",
    subtitle: "Los artífices detrás de Virtual Knockout",
    
    team: [
        {
            id: 1,
            name: "Erik Ramos",
            role: "Desarrollador Principal",
            roleColor: "#3A86FF",
            borderColor: "#E63946",
            avatar: "👨‍💻",
            image: "images/descripcion1.png",
            fallbackGradient: "from-[#E63946] to-[#FF4D8B]",
            fallbackLetter: "D",
            bio: "Especializado en Unity y desarrollo VR. Lideró la implementación del sistema de combate y mecánicas de juego.",
            skills: [
                { name: "Unity", color: "#3A86FF" },
                { name: "VR Dev", color: "#E63946" },
                { name: "C#", color: "#FF4D8B" }
            ]
        },
        {
            id: 2,
            name: "Lizardo Castillo",
            role: "Diseñador UX/UI",
            roleColor: "#E63946",
            borderColor: "#3A86FF",
            avatar: "🎨",
            image: "images/objetivo1.png",
            fallbackGradient: "from-[#3A86FF] to-[#4F94FF]",
            fallbackLetter: "UX",
            bio: "Experto en IHC y diseño de interfaces. Responsable de la experiencia de usuario y el diseño visual del proyecto.",
            skills: [
                { name: "UX/UI", color: "#E63946" },
                { name: "IHC", color: "#3A86FF" },
                { name: "Figma", color: "#FFD700" }
            ]
        },
        {
            id: 3,
            name: "Karla Cornejo",
            role: "Artista 3D",
            roleColor: "#FFD700",
            borderColor: "#FF4D8B",
            avatar: "🎭",
            image: "images/cinturon.png",
            fallbackGradient: "from-[#FF4D8B] to-[#FFD700]",
            fallbackLetter: "3D",
            bio: "Modelado 3D y animaciones. Creó todos los assets visuales, personajes y entornos del juego VR.",
            skills: [
                { name: "Blender", color: "#FF4D8B" },
                { name: "3D Art", color: "#FFD700" },
                { name: "Animación", color: "#3A86FF" }
            ]
        },
        {
            id: 4,
            name: "Fernando Deza",
            role: "Ingeniero de Software",
            roleColor: "#FF4D8B",
            borderColor: "#FFD700",
            avatar: "⚙️",
            image: "images/ganar.png",
            fallbackGradient: "from-[#FFD700] to-[#E63946]",
            fallbackLetter: "SW",
            bio: "Optimización y arquitectura del código. Encargado del testing, debugging y rendimiento del juego.",
            skills: [
                { name: "Testing", color: "#FFD700" },
                { name: "Debug", color: "#E63946" },
                { name: "Git", color: "#3A86FF" }
            ]
        }
    ],
    
    projectInfo: {
        icon: "🎓",
        title: "Proyecto Académico",
        course: "Interacción Humano-Computadora",
        description: "Este proyecto fue desarrollado como parte del curso de Interacción Humano-Computadora, aplicando metodologías de diseño centrado en el usuario y principios de usabilidad en el desarrollo de experiencias inmersivas.",
        stats: [
            { value: "2025-B", label: "Semestre", color: "#E63946" },
            { value: "IHC", label: "Curso", color: "#3A86FF" },
            { value: "Unity VR", label: "Tecnología", color: "#FF4D8B" },
            { value: "4", label: "Integrantes", color: "#FFD700" }
        ]
    }
};

