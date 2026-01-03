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
        confirm: string;
        success: string;
    };
    auth: {
        login_btn: string;
        register_btn: string;
        try_free: string;
        welcome: string;
        login_title: string;
        login_subtitle: string;
        register_title: string;
        register_subtitle: string;
        email_phone_label: string;
        email_phone_placeholder: string;
        password_label: string;
        password_placeholder: string;
        confirm_password_label: string;
        confirm_password_placeholder: string;
        forgot_password_link: string;
        forgot_password: {
            title: string;
            description: string;
            phone_label: string;
            support_hint: string;
            whatsapp_message: string;
            back_to_login: string;
            contact_support: string;
        };
        no_account: string;
        has_account: string;
        login_here: string;
        register_here: string;
        name_label: string;
        company_label: string;
        company_placeholder: string;
        phone_label: string;
        phone_placeholder: string;
        errors: {
            invalid_credentials: string;
            passwords_mismatch: string;
            generic: string;
            connection: string;
        };
        success: {
            account_created: string;
            login_redirect: string;
            register_redirect: string;
        };
    };
    home: {
        hero_title: string;
        hero_subtitle: string;
        cta_primary: string;
        cta_secondary: string;
        trusted_by: string;
        hero_check1: string;
        hero_check2: string;
        hero_check3: string;
        benefits_title: string;
        benefits_subtitle: string;
        benefits: {
            title: string;
            desc: string;
            metric: string;
        }[];
        how_it_works_title: string;
        how_it_works_subtitle: string;
        steps: {
            title: string;
            desc: string;
        }[];
        testimonials_title: string;
        testimonials_subtitle: string;
        testimonials: {
            name: string;
            role: string;
            text: string;
        }[];
        social_proof: {
            companies: string;
            closures: string;
            time: string;
        };
        cta_final_title: string;
        cta_final_subtitle: string;
        cta_final_btn: string;
        cta_final_hint: string;
        booking_banner: string;
        visit_hub: string;
        footer_rights: string;
        mockup: {
            verified: string;
            industry: string;
            msg1: string;
            msg2: string;
            ai_tag: string;
            typing: string;
            footer: string;
        };
        about_title: string;
        about_items: {
            security: string;
            b2b: string;
            network: string;
            integration: string;
        };
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
    chat: {
        sidebar: {
            recent_chats: string;
            search_placeholder: string;
            new_chat: string;
            new_group: string;
            my_profile: string;
            starred_messages_title: string;
            select_chats: string;
            cancel_selection: string;
            settings: string;
            sign_out: string;
            global_network: string;
            scanning: string;
            no_global_results: string;
            independent_user: string;
            delete_confirm: string;
            delete_success: string;
            selection_count: string;
            group_suffix: string;
            empty_hint: string;
        };
        window: {
            online: string;
            offline: string;
            typing: string;
            input_placeholder: string;
            loading: string;
            no_messages: string;
            select_chat: string;
            member: string;
            starred_title: string;
            unstar_title: string;
            whatsapp_confirm: string;
            whatsapp_success: string;
            options: {
                info: string;
                mute: string;
                delete: string;
                search: string;
                more: string;
            };
            email_toast: {
                title: string;
                body: string;
            };
        };
        modals: {
            profile: {
                title: string;
                name_label: string;
                phone_label: string;
                success: string;
            };
            group: {
                title: string;
                subtitle: string;
                name_label: string;
                name_placeholder: string;
                desc_label: string;
                desc_placeholder: string;
                participants: string;
                create_btn: string;
                creating: string;
                validation_error: string;
            };
            invitation: {
                title: string;
                not_registered: string;
                hint: string;
                link_label: string;
                copy_success: string;
                whatsapp_btn: string;
            };
        };
        sidebar_title: string;
        search_placeholder: string;
        new_chat: string;
        no_messages: string;
        type_message: string;
        send: string;
        online: string;
        offline: string;
        last_seen: string;
        email_sent_toast: string;
        actions: {
            pin: string;
            unpin: string;
            favorite: string;
            unfavorite: string;
            delete: string;
            mute: string;
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
            payment_pending: string;
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
