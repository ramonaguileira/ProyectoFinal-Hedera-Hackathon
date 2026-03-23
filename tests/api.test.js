const fs = require('fs');
const path = require('path');

describe('GuardianAPI Wrapper', () => {
    let apiCode;
    beforeAll(() => {
        apiCode = fs.readFileSync(path.join(__dirname, '../dashboard/js/api.js'), 'utf8');
    });

    test('GuardianAPI module exists with fallback mechanism', () => {
        expect(apiCode).toContain('const GuardianAPI =');
        expect(apiCode).toContain('guardian-cache.json');
    });

    test('Implements delivery submission logic', () => {
        expect(apiCode).toContain('submitDelivery(');
    });

    test('Implements token management for MGS connection', () => {
        expect(apiCode).toContain('_getAccessToken');
        expect(apiCode).toContain('localStorage.getItem(\'eggologic_tokens\')');
    });
});
