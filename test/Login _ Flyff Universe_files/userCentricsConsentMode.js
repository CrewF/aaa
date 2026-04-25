var ConsentManager = {
    config: {
        metaPixelId: '733881727616194'
    },

    state: {
        hasGoogleFontsConsent: false,
        hasStripeConsent: false,
        hasMetaPixelConsent: false,

        isGoogleFontInitialized: false,
        isStripeInitialized: false,
        isMetaPixelInitialized: false,

        metaPageViewFired: false
    },

    init: function () {
        var self = this;
        window.addEventListener('ucEvent', function (e) {
            self.handleConsentUpdate(e);
        });
    },

    handleConsentUpdate: function (e) {
        window.dataLayer.push({ event: 'ucEvent', ucEventData: e.detail });

        if (!e.detail || e.detail.event !== 'consent_status') return;

        this.updateAllConsentStates(e.detail);

        this.updateGCM(e.detail);

        this.controlMetaPixel();
        this.controlGoogleFonts();
        this.controlStripe();
    },

    updateAllConsentStates: function (detail) {
        this.state.hasGoogleFontsConsent = detail['Google Fonts'] === true;
        this.state.hasStripeConsent = detail['Stripe'] === true;
        this.state.hasMetaPixelConsent = detail['Meta Pixel'] === true;
    },

    updateGCM: function (detail) {
        const adServices = ['DoubleClick Ad', 'Google Ads', 'Meta Pixel'];
        const analyticsServices = ['Google Analytics 4'];
        const functionalServices = ['Google AJAX', 'Google Fonts', 'Google Play', 'Google Tag Manager', 'Stripe', 'Youtube Video', 'reCAPTCHA'];
        const personalizationService = ['Youtube Video', 'Google Play'];
        const adUserDataService = ['DoubleClick Ad', 'Google Ads', 'Meta Pixel'];
        const adPersonalizationService = ['DoubleClick Ad', 'Google Ads', 'Meta Pixel'];
        const securityService = ['reCAPTCHA', 'Google Tag Manager'];

        const consentUpdate = {
            'ad_storage': adServices.some(s => detail[s]) ? 'granted' : 'denied',
            'analytics_storage': analyticsServices.some(s => detail[s]) ? 'granted' : 'denied',
            'functionality_storage': functionalServices.some(s => detail[s]) ? 'granted' : 'denied',
            'personalization_storage': personalizationService.some(s => detail[s]) ? 'granted' : 'denied',
            'ad_personalization': adPersonalizationService.some(s => detail[s]) ? 'granted' : 'denied',
            'ad_user_data': adUserDataService.some(s => detail[s]) ? 'granted' : 'denied',
            'security_storage': securityService.some(s => detail[s]) ? 'granted' : 'denied'
        };

        gtag('consent', 'update', consentUpdate);
    },

    controlGoogleFonts: function () {
        if (this.state.hasGoogleFontsConsent && !this.state.isGoogleFontInitialized) {
            this.state.isGoogleFontInitialized = true;

            const fontUrls = [
                'https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap'
            ];

            fontUrls.forEach(url => {
                const fontLink = document.createElement('link');
                fontLink.href = url;
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
            });
        }
    },

    controlStripe: function () {
        if (this.state.hasStripeConsent && !this.state.isStripeInitialized) {
            this.state.isStripeInitialized = true;

            const stripeLink = document.createElement('script');
            stripeLink.src = 'https://js.stripe.com/basil/stripe.js';
            document.head.appendChild(stripeLink);
        }
    },
	
	initializeMetaPixel: function() {
        if (this.state.isMetaPixelInitialized) return;
        var self = this;
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script', 'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', self.config.metaPixelId);
        this.state.isMetaPixelInitialized = true;
    },

    controlMetaPixel: function() {
        if (this.state.hasMetaPixelConsent) {
            if (!this.state.isMetaPixelInitialized) 
                this.initializeMetaPixel();

            fbq('consent', 'grant');

            if (!this.state.metaPageViewFired) {
                fbq('track', 'PageView');
                this.state.metaPageViewFired = true;
            }
        } else {
            if (this.state.isMetaPixelInitialized) 
                fbq('consent', 'revoke');
            
            this.state.metaPageViewFired = false;
        }
    }
};

ConsentManager.init();

document.addEventListener('DOMContentLoaded', function () {
    let path = window.location.pathname;
    path = path.replace(/^\/+/, '/');
    let clickEvents = [];

    switch (path) {
        case '/murans-awakening-update':
            clickEvents = [
                { eventName: 'CLICK_PREREGI', selector: 'a[href="#preregistration"]' },
                { eventName: 'CLICK_LOGIN', selector: '#preregistration .mt-4 a:nth-child(1)' },
                { eventName: 'CLICK_REGISTER', selector: '#preregistration .mt-4 a:nth-child(2)' },
                { eventName: 'CLICK_DISCORD', selector: '#socials a:nth-child(1)' },
                { eventName: 'CLICK_INSTAGRAM', selector: '#socials a:nth-child(2)' },
                { eventName: 'CLICK_FACEBOOK', selector: '#socials a:nth-child(3)' },
                { eventName: 'CLICK_SHARE', selector: '#socials a:nth-child(4)' }
            ];
            break;
        case '/user/login':
            clickEvents = [
                { eventName: 'COMPLETE_LOGIN', selector: '#captcha-form button[type="submit"]' }
            ];
            break;
        case '/user/register/agreement':
            clickEvents = [
                { eventName: 'COMPLETE_REGISTER', selector: 'form button[type="submit"]' }
            ];
            break;
    }

    if (clickEvents && clickEvents.length > 0) {
        clickEvents.forEach(eventInfo => {
            try {
                const elements = document.querySelectorAll(eventInfo.selector);

                if (elements.length > 0) {
                    elements.forEach(element => {
                        element.addEventListener('click', function (e) {
                            e.preventDefault();

                            let callback = function () {
                                if (element.type === 'submit') {
                                    element.closest('form').requestSubmit();
                                }
                                else if (element.href) {
                                    if (element.hash) {
                                        const targetElement = document.querySelector(element.hash);
                                        if (targetElement) {
                                            targetElement.scrollIntoView({
                                                behavior: 'smooth',
                                                block: 'start'
                                            });
                                        }
                                    }
                                    else if (element.target === '_blank') {
                                        window.open(element.href, '_blank');
                                    }
                                    else {
                                        window.location.href = element.href;
                                    }
                                }
                            };

                            gtag('event', eventInfo.eventName, {
                                'event_callback': callback,
                                'event_timeout': 800
                            });

                            setTimeout(callback, 1000);
                        });
                    });
                }
            } catch (error) {
                console.error(`Error finding element with selector "${eventInfo.selector}":`, error);
            }
        });
    }
});