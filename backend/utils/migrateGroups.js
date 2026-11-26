const mongoose = require('mongoose');
require('dotenv').config();
const Child = require('../models/Child');
const Group = require('../models/Group');
const User = require('../models/User');

const defaultColors = ['#ff9800', '#f44336', '#4caf50', '#2196f3', '#9c27b0', '#795548'];

async function migrateGroups() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Get all users
    const users = await User.find();
    
    for (const user of users) {
      console.log(`Migrating groups for user: ${user.email}`);
      
      // Get distinct group names for this user
      const groupNames = await Child.distinct('group', {
        user: user._id,
        isActive: true,
        group: { $ne: '' }
      });

      // Create Group documents for each unique group name
      for (let i = 0; i < groupNames.length; i++) {
        const groupName = groupNames[i];
        
        // Check if group already exists
        const existingGroup = await Group.findOne({
          user: user._id,
          name: groupName,
          isActive: true
        });

        if (!existingGroup) {
          // Get children in this group
          const childrenInGroup = await Child.find({
            user: user._id,
            group: groupName,
            isActive: true
          }).select('_id');

          const childIds = childrenInGroup.map(child => child._id);
          
          // Create new group with a default color
          const group = await Group.create({
            user: user._id,
            name: groupName,
            color: defaultColors[i % defaultColors.length],
            children: childIds
          });
          
          console.log(`Created group: ${groupName} with color: ${group.color}`);
        }
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateGroups();