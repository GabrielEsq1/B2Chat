export type Language = 'es' | 'en';

export interface Translation {
    common: {
        loading: string;
        error: string;
        save: string;
        cancel: string;
        back: string;
        delete: string;
        edit: string;
        search: string;
        filter: string;
        view_more: string;
        next: string;
        prev: string;
        finish: string;
        close: string;
        pending: string;
    };
    auth: {
        login_btn: string;
        register_btn: string;
        try_free: string;
        welcome: string;
    };
    home: {
        hero_title: string;
        hero_subtitle: string;
        cta_primary: string;
        cta_secondary: string;
        trusted_by: string;
        benefits_title: string;
        benefits_subtitle: string;
        how_it_works_title: string;
        how_it_works_subtitle: string;
        testimonials_title: string;
        cta_final_title: string;
        cta_final_subtitle: string;
        footer_rights: string;
    };
    dashboard: {
        welcome: string;
        subtitle: string;
        stats: {
            conversations: string;
            campaigns: string;
            connections: string;
            messages: string;
        };
        menu: {
            dashboard: string;
            chat: string;
            contacts: string;
            discover: string;
            ads: string;
            store: string;
            create_store: string;
        };
    };
    ads: {
        title: string;
        subtitle: string;
        create_btn: string;
        active_stories: string;
        no_stories: string;
        create_first: string;
        status: {
            draft: string;
            pending: string;
            active: string;
            rejected: string;
            paused: string;
        };
        wizard: {
            steps: {
                details: string;
                segmentation: string;
                budget: string;
                creative: string;
                review: string;
                payment: string;
            };
            details: {
                name_label: string;
                objective_label: string;
                placeholders: {
                    name: string;
                };
            };
            segmentation: {
                industry_label: string;
                sector_label: string;
                roles_label: string;
                age_label: string;
                gender_label: string;
                location_label: string;
            };
            budget: {
                daily_label: string;
                total_label: string;
                duration_label: string;
            };
            creative: {
                type_label: string;
                upload_label: string;
                text_label: string;
                desc_label: string;
                url_label: string;
            };
            payment: {
                title: string;
                instructions: string;
                upload_proof: string;
            };
        };
    };
    ecosystem: {
        seal: string;
        title: string;
        description: string;
        diagram: {
            step1: string;
            step2: string;
        };
        cta_cross: string;
    };
    hub: {
        hero_title: string;
        hero_subtitle: string;
        ceo_name: string;
        ceo_title: string;
        ceo_summary: string;
        experience_title: string;
        portfolio_title: string;
        view_project: string;
    };
}
