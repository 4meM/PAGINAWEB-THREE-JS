/**
 * DATA: Contenido de los módulos de Proyecto IHC
 * Define el contenido para cada módulo: Momentos, Necesidades, Entrevistas, Storyboard
 */

export const MOMENTOS_CONTENT = {
    title: 'Momentos Interesantes',
    description: 'Análisis de los momentos clave identificados durante la investigación de usuarios.',
    sections: [
        {
            title: 'Introducción',
            content: 'Aquí documentamos los momentos más relevantes que descubrimos durante nuestras entrevistas y observaciones.'
        }
    ]
};
// Video agregado solicitado por el usuario para el módulo Momentos
MOMENTOS_CONTENT.videos = [
    {
        title: 'Momento - Video',
        driveId: '1a3ePBheMBEx1kHvJeL9SZBQiz6MV2jqY',
        type: 'video'
    }
];

export const NECESIDADES_CONTENT = {
    title: 'Necesidades del Usuario',
    description: 'Identificación y análisis de las necesidades principales de los usuarios.',
    sections: [
        {
            title: 'Introducción',
            content: 'Basándonos en nuestra investigación, hemos identificado las siguientes necesidades clave.'
        }
    ]
};

export const ENTREVISTAS_CONTENT = {
    title: 'Entrevistas',
    description: 'Selecciona una persona para ver sus entrevistas.',
    personas: [
        {
            name: 'Lizardo',
            entrevistas: [
                { title: 'Entrevista 1 - Estudiante Universitario', driveId: '17AuR12exCGrkPPlZYLahRdfLxgMEesvb', type: 'video' },
                { title: 'Entrevista 2 - Trabajador', driveId: '1Gnm8_Wcxk-xbUOJ5Il6jCEO8sZ-hM9VE', type: 'video' },
                { title: 'Entrevista 3 - Estudiante', driveId: '1qQ7PUKTPV6O5PEwJR6_2yetLUfZLnMKp', type: 'video' },
                { title: 'Entrevista 4 - Conductor', driveId: '1u-SSJyJmLt6l9L1oaw7sGmdqBMoV1sFw', type: 'video' },
                { title: 'Entrevista 5 - Conductor', driveId: '1HZjGqL2tpLaHu9U8v3rcqf8MQZp6zZlX', type: 'video'  }
            ]
        },
        
        {
            name: 'Karla',
            entrevistas: [
                { title: 'Entrevista 1 - Estudiante', driveId: '1tgLgLt4_Gru-VBScQnj8POKZd31RiKHr', type: 'video' },
                { title: 'Entrevista 2 - Regidor', driveId: '1nmvVr6g8-3lNpKrwUBdJtzd6Sllj3XLY', type: 'video' },
                { title: 'Entrevista 3 - Estudiante que busca comodidad', driveId: '1kIiDbu8wlGKBAypHP-Oe6MMGaTV844Gx', type: 'video' },
                { title: 'Entrevista 4 - Estudiante que usa mucho el transporte', driveId: '1n7BPuLywVCOEp95vAwuI0IoSVsS8jvcP', type: 'video' },
                { title: 'Entrevista 5 - Estudiante que usa mucho el transporte', driveId: '13vvs-t3JHMaEMatb8iwzCKi-XcgnnoHG', type: 'video' }
            ]
        },
        
        {
            name: 'Erik',
            entrevistas: [
                { title: 'Entrevista 1 - Estudiante Foraneo', driveId: '1V1qxPW7tdHR0vg0UwCWHKFEa-T7IaXWQ', type: 'video' },
                { title: 'Entrevista 2 - Estudiante', driveId: '1nT2FVq3QbJa6La1Bl-j6mW0IeyTQTgLQ', type: 'audio' },
                { title: 'Entrevista 3 - Estudiante Nativo', driveId: '1d0i_YWY9HOiVuCsT2gi9qYogeaFsHqxx', type: 'audio' },
                { title: 'Entrevista 4 - Estudiante Nativo', driveId: '1fznYjfL5n-qXeh_WFol4UrasaIMSbEn1', type: 'video' }
                // Para audios: { title: 'Audio 1', driveId: 'ID', type: 'audio' }
            ]
        },

        {
            name: 'Fernando',
            entrevistas: [
                { title: 'Entrevista 1 - Conductor', driveId: '1HZjGqL2tpLaHu9U8v3rcqf8MQZp6zZlX', type: 'audio' },
                { title: 'Entrevista 2 - Universitario', driveId: '1Aa5bJ6VBCRKnVSGc8hzLNe4iK62SaeOj', type: 'audio' },
                { title: 'Entrevista 3 - Universitario', driveId: '10o2N6Cb9tGkzPWbZBr-efbJM_eGscfy5', type: 'audio' }
            ]
        }
    ]
};

export const PROTOTIPO_CONTENT = {
    title: 'Prototipo',
    videos: [
        {
            title: 'Pruebas del Prototipo con Usuarios',
            driveId: '1nkhd440Fz0_tFBYUOPy-D7QdY5lgVC3w',
            type: 'video'
        },
        {
            title: 'Funcionamiento de la Aplicacion',
            driveId: '1C-uT1ZPO1w9cvVWgeaLJ77d9ixI_LDiy',
            type: 'video'
        }
    ]
};

export const STORYBOARD_CONTENT = {
    title: 'Storyboard',
    videos: [
        {
            phase: 'FASE 1',
            title: 'FASE 1',
            driveId: '1tH6dzJ7K8L9rcnwmva4hj0BoZOgAnMv_'
        },
        {
            phase: 'FASE 2',
            title: 'FASE 2',
            driveId: '1Tfn3dTUgNQNqwMJ5iDEK4OT8InKg6Czl'
        },
        {
            phase: 'FASE 3',
            title: 'FASE 3',
            driveId: '1HkPUPXWu7l08ml6PxAPSnwhqAcgdPBpi'
        },
        {
            phase: 'FASE 4',
            title: 'FASE 4',
            driveId: '1-cQQTBXe4I7AzwzDU_NKRhPbo5vC2eWE'
        }
    ]
};
