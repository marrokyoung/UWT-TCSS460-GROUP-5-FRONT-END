interface FormState {
    errors?: {
        isbn13?: string | undefined;
        authors?: string | undefined;
        publication_year?: string | undefined;
        title?: string | undefined;
        original_title?: string | undefined;
    } | undefined;
    message?: string | undefined;
}
