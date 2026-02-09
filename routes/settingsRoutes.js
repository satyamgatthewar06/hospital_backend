import express from 'express';
import { dbPool } from '../server.js';

const router = express.Router();

// GET user settings by userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await dbPool.query(
            'SELECT settingsData FROM user_settings WHERE userId = ?',
            [userId]
        );

        if (rows.length === 0) {
            // Return default settings if none exist
            return res.status(200).json({
                success: true,
                data: null,
                message: 'No settings found, using defaults'
            });
        }

        res.status(200).json({
            success: true,
            data: JSON.parse(rows[0].settingsData)
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
            error: error.message
        });
    }
});

// POST/UPDATE user settings
router.post('/', async (req, res) => {
    try {
        const { userId, settings } = req.body;

        if (!userId || !settings) {
            return res.status(400).json({
                success: false,
                message: 'userId and settings are required'
            });
        }

        const settingsJson = JSON.stringify(settings);

        // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
        await dbPool.query(
            `INSERT INTO user_settings (userId, settingsData) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE settingsData = ?, updatedAt = CURRENT_TIMESTAMP`,
            [userId, settingsJson, settingsJson]
        );

        res.status(200).json({
            success: true,
            message: 'Settings saved successfully'
        });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save settings',
            error: error.message
        });
    }
});

// DELETE user settings (reset to defaults)
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        await dbPool.query(
            'DELETE FROM user_settings WHERE userId = ?',
            [userId]
        );

        res.status(200).json({
            success: true,
            message: 'Settings reset to defaults'
        });
    } catch (error) {
        console.error('Error deleting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset settings',
            error: error.message
        });
    }
});

export default router;
