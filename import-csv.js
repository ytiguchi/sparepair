const fs = require('fs');
const path = require('path');

// Firebase Admin SDK setup
const admin = require('firebase-admin');

// Initialize Firebase Admin with service account key
// You need to download the service account key from Firebase Console:
// 1. Go to Firebase Console > Project Settings > Service Accounts
// 2. Click "Generate new private key"
// 3. Save the file as 'serviceAccountKey.json' in this directory

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
    console.error('❌ Error: serviceAccountKey.json not found!');
    console.log('\nPlease follow these steps:');
    console.log('1. Go to Firebase Console (https://console.firebase.google.com)');
    console.log('2. Select your project');
    console.log('3. Go to Project Settings (gear icon) > Service Accounts');
    console.log('4. Click "Generate new private key"');
    console.log('5. Save the downloaded file as "serviceAccountKey.json" in the project root (c:\\Dev)');
    console.log('\nThen run this script again.');
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
    process.exit(1);
}

const db = admin.firestore();
const csvPath = path.join(__dirname, 'data.csv');

const csvContent = fs.readFileSync(csvPath, 'utf8');

// Simple CSV parser that handles quoted fields with newlines
function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                currentField += '"';
                i++; // Skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentField);
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            currentRow.push(currentField);
            rows.push(currentRow);
            currentRow = [];
            currentField = '';
        } else {
            currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }
    return rows;
}

const rows = parseCSV(csvContent);
// Remove header
const dataRows = rows.slice(1);

const reports = dataRows.map((row, index) => {
    if (row.length < 5) return null; // Skip empty rows

    const timestamp = row[0];
    const reporter = row[1] === '匿名で回答する' ? '匿名' : row[1];
    const facility = row[3];
    const location = row[4];
    const imageUrl = row[5];
    const item = row[6]; // Category
    const priority = row[7];
    const emergencyAction = row[8];
    const remarks = row[9];
    const statusRaw = row[10];

    let status = 'Open';
    if (statusRaw && statusRaw.includes('済')) {
        status = 'Fixed';
    }

    // Combine remarks
    let fullRemarks = remarks || '';
    if (emergencyAction) {
        fullRemarks = (fullRemarks ? fullRemarks + '\n' : '') + '応急対応: ' + emergencyAction;
    }
    if (priority) {
        fullRemarks = (fullRemarks ? fullRemarks + '\n' : '') + '緊急度: ' + priority;
    }

    return {
        timestamp,
        reporter,
        facility,
        location,
        item,
        imageUrl,
        remarks: fullRemarks,
        status,
        history: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
}).filter(Boolean);

// Import to Firebase
async function importToFirebase() {
    try {
        const reportsRef = db.collection('reports');

        console.log(`\n📊 Found ${reports.length} reports in CSV file`);
        console.log('🔄 Importing to Firebase Firestore...\n');

        // Check if there are existing reports
        const existingSnapshot = await reportsRef.limit(1).get();
        if (!existingSnapshot.empty) {
            console.log('⚠️  Warning: The "reports" collection already has data.');
            console.log('   This script will ADD the CSV data to the existing collection.');
            console.log('   If you want to replace all data, please delete the collection first.\n');
        }

        // Use batched writes (Firestore limit is 500 operations per batch)
        const batchSize = 500;
        let imported = 0;

        for (let i = 0; i < reports.length; i += batchSize) {
            const batch = db.batch();
            const chunk = reports.slice(i, i + batchSize);

            for (const report of chunk) {
                const docRef = reportsRef.doc(); // Auto-generate ID
                batch.set(docRef, report);
            }

            await batch.commit();
            imported += chunk.length;
            console.log(`✓ Imported ${imported}/${reports.length} reports...`);
        }

        console.log(`\n✅ Successfully imported ${reports.length} reports to Firebase!`);
        console.log('🎉 You can now view them in your app or Firebase Console.\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error importing to Firebase:', error);
        console.error('\nDetails:', error.message);
        process.exit(1);
    }
}

importToFirebase();
