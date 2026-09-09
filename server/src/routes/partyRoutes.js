import { Router } from 'express';
import { getParties, createParty, updateParty, deleteParty, getPartyLedger } from '../controllers/partyController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getParties);
router.post('/', createParty);
router.put('/:id', updateParty);
router.delete('/:id', deleteParty);
router.get('/:id/ledger', getPartyLedger);

export default router;
