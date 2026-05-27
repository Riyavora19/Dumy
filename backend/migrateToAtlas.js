const mongoose = require('mongoose');

// Connection URIs
const LOCAL_URI = 'mongodb://localhost:27017/mernapp';
const ATLAS_URI = process.env.MONGO_URI || 'mongodb://shahvishalbharat_db_user:Shreerajcorporation100@ac-j0o5pjs-shard-00-00.szyyt5w.mongodb.net:27017,ac-j0o5pjs-shard-00-01.szyyt5w.mongodb.net:27017,ac-j0o5pjs-shard-00-02.szyyt5w.mongodb.net:27017/mernapp?ssl=true&replicaSet=atlas-5ve7wi-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function migrateData() {
  try {
    console.log('🔄 Starting migration from local MongoDB to Atlas...\n');

    // Connect to local MongoDB
    console.log('📡 Connecting to local MongoDB...');
    const localConnection = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB\n');

    // Connect to Atlas
    console.log('📡 Connecting to MongoDB Atlas...');
    const atlasConnection = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get all collections from local database
    const collections = await localConnection.db.listCollections().toArray();
    console.log(`📦 Found ${collections.length} collections to migrate:\n`);

    let totalDocuments = 0;

    // Migrate each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\n🔄 Migrating collection: ${collectionName}`);

      // Get data from local collection
      const localCollection = localConnection.db.collection(collectionName);
      const documents = await localCollection.find({}).toArray();

      if (documents.length === 0) {
        console.log(`   ⚠️  Collection is empty, skipping...`);
        continue;
      }

      // Insert data into Atlas collection
      const atlasCollection = atlasConnection.db.collection(collectionName);
      
      // Clear existing data in Atlas collection (optional)
      await atlasCollection.deleteMany({});
      
      // Insert documents
      await atlasCollection.insertMany(documents);
      
      totalDocuments += documents.length;
      console.log(`   ✅ Migrated ${documents.length} documents`);
    }

    console.log(`\n\n🎉 Migration completed successfully!`);
    console.log(`📊 Total documents migrated: ${totalDocuments}`);
    console.log(`📦 Total collections migrated: ${collections.length}\n`);

    // Close connections
    await localConnection.close();
    await atlasConnection.close();
    console.log('🔌 Connections closed');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateData();
