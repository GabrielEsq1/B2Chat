import { PrismaClient } from '../node_modules/@prisma/client';

const prisma = new PrismaClient();

const topColombianCompanies = [
    {
        name: "Bancolombia",
        industry: "Banca y Finanzas",
        city: "Medellín",
        website: "https://www.bancolombia.com",
        email: "info@bancolombia.com",
        description: "Grupo financiero líder en Colombia y Centroamérica"
    },
    {
        name: "Grupo Éxito",
        industry: "Retail",
        city: "Medellín",
        website: "https://www.grupoexito.com.co",
        email: "contacto@exito.com.co",
        description: "Cadena de supermercados y retail líder en Colombia"
    },
    {
        name: "Ecopetrol",
        industry: "Energía y Petróleo",
        city: "Bogotá",
        website: "https://www.ecopetrol.com.co",
        email: "info@ecopetrol.com.co",
        description: "Empresa de energía más grande de Colombia"
    },
    {
        name: "Avianca",
        industry: "Aerolíneas",
        city: "Bogotá",
        website: "https://www.avianca.com",
        email: "servicioalcliente@avianca.com",
        description: "Aerolínea líder en Colombia y Latinoamérica"
    },
    {
        name: "Grupo Argos",
        industry: "Construcción e Infraestructura",
        city: "Medellín",
        website: "https://www.grupoargos.com",
        email: "info@grupoargos.com",
        description: "Conglomerado de cemento, energía e infraestructura"
    },
    {
        name: "Rappi",
        industry: "Tecnología y Delivery",
        city: "Bogotá",
        website: "https://www.rappi.com.co",
        email: "soporte@rappi.com",
        description: "Super app de delivery y servicios digitales"
    },
    {
        name: "Coca-Cola FEMSA Colombia",
        industry: "Bebidas",
        city: "Bogotá",
        website: "https://www.coca-colafemsa.com",
        email: "contacto@kof.com.co",
        description: "Embotelladora y distribuidora de Coca-Cola"
    },
    {
        name: "Bavaria",
        industry: "Bebidas",
        city: "Bogotá",
        website: "https://www.ab-inbev.com",
        email: "contacto@bavaria.co",
        description: "Cervecería líder en Colombia"
    },
    {
        name: "Cementos Argos",
        industry: "Construcción",
        city: "Medellín",
        website: "https://www.argos.co",
        email: "info@argos.co",
        description: "Productor de cemento y concreto líder en la región"
    },
    {
        name: "Grupo Nutresa",
        industry: "Alimentos",
        city: "Medellín",
        website: "https://www.gruponutresa.com",
        email: "info@nutresa.com",
        description: "Empresa de alimentos procesados más grande de Colombia"
    },
    {
        name: "EPM (Empresas Públicas de Medellín)",
        industry: "Servicios Públicos",
        city: "Medellín",
        website: "https://www.epm.com.co",
        email: "info@epm.com.co",
        description: "Grupo empresarial de servicios públicos"
    },
    {
        name: "Claro Colombia",
        industry: "Telecomunicaciones",
        city: "Bogotá",
        website: "https://www.claro.com.co",
        email: "atencion@claro.com.co",
        description: "Operador de telecomunicaciones líder"
    },
    {
        name: "Movistar Colombia",
        industry: "Telecomunicaciones",
        city: "Bogotá",
        website: "https://www.movistar.co",
        email: "contacto@movistar.co",
        description: "Proveedor de servicios de telecomunicaciones"
    },
    {
        name: "Tigo Colombia",
        industry: "Telecomunicaciones",
        city: "Bogotá",
        website: "https://www.tigo.com.co",
        email: "servicio@tigo.com.co",
        description: "Empresa de telecomunicaciones móviles"
    },
    {
        name: "Grupo Aval",
        industry: "Holding Financiero",
        city: "Bogotá",
        website: "https://www.grupoaval.com",
        email: "info@grupoaval.com",
        description: "Grupo financiero más grande de Colombia"
    }
];

async function seedCompanies() {
    try {
        console.log('🌱 Seeding pre-fabricated company profiles...\n');

        for (const companyData of topColombianCompanies) {
            const existing = await prisma.company.findFirst({
                where: { name: companyData.name }
            });

            if (!existing) {
                const company = await prisma.company.create({
                    data: {
                        name: companyData.name,
                        isActivated: false,
                        publicInfo: {
                            industry: companyData.industry,
                            city: companyData.city,
                            website: companyData.website,
                            email: companyData.email,
                            description: companyData.description
                        }
                    }
                });
                console.log(`✅ Created: ${company.name} (${companyData.industry})`);
            } else {
                console.log(`⏭️  Skipped: ${companyData.name} (already exists)`);
            }
        }

        console.log('\n🎉 Company seeding complete!');
        console.log(`📊 Total companies in database: ${await prisma.company.count()}`);
        console.log(`🔵 Available profiles: ${await prisma.company.count({ where: { isActivated: false } })}`);
        console.log(`🟢 Activated profiles: ${await prisma.company.count({ where: { isActivated: true } })}`);

    } catch (error) {
        console.error('❌ Error seeding companies:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedCompanies();
