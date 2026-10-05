"use client";

import { useEffect } from "react";
import { captureAdParams, initAdsTags, trackWhatsAppClicks } from "./tracking";

/**
 * Invisible half of the landing page's instrumentation: queues the ad tags (only once real
 * IDs are configured), keeps the visitor's gclid/UTM values for the later form submission,
 * and reports clicks on any WhatsApp button. Renders nothing. It stays mounted even after
 * the form is replaced by the thank-you panel, so those clicks are still counted.
 */
export default function AdsTracking() {
    useEffect(() => {
        captureAdParams();
        initAdsTags();
        return trackWhatsAppClicks();
    }, []);

    return null;
}
