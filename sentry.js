import * as Sentry from 'sentry-expo';

export default Sentry.init({
    dsn: 'https://f8a02133e800455c86bee49793874e17@sentry.io/2581571',
    enableInExpoDevelopment: true,
    debug: true
});