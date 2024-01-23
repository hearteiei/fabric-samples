// DiplomaContract.js

'use strict';

const { Contract } = require('fabric-contract-api');

class DiplomaContract extends Contract {
    async createDiploma(ctx, studentID, diplomaNumber, subjects) {
        // Check if diploma with the given diplomaNumber already exists
        const existingDiploma = await ctx.stub.getState(diplomaNumber);
        if (existingDiploma && existingDiploma.length > 0) {
            throw new Error(`Diploma with number ${diplomaNumber} already exists`);
        }

        // Check if the transaction submitter has the necessary permissions to create diplomas
        const submitterPublicKey = ctx.stub.getCreator();
        // Add logic to check if the submitter has the role of the issuer or any other relevant check

        // Create a new diploma record
        const diplomaRecord = {
            studentID,
            diplomaNumber,
            subjects,
            issuerPublicKey: submitterPublicKey, // Store the public key of the issuer for verification purposes
        };

        // Store the diploma record on the ledger
        await ctx.stub.putState(diplomaNumber, Buffer.from(JSON.stringify(diplomaRecord)));

        // Return the created diploma information
        return 'Diploma created successfully';
    }

    async queryDiploma(ctx, diplomaNumber) {
        // Retrieve the diploma record for the given diplomaNumber
        const diplomaRecord = await ctx.stub.getState(diplomaNumber);

        if (!diplomaRecord || diplomaRecord.length === 0) {
            throw new Error(`Diploma with number ${diplomaNumber} not found`);
        }

        return JSON.parse(diplomaRecord.toString('utf8'));
    }

    async getAllDiplomas(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');

        const diplomas = [];
        while (true) {
            const result = await iterator.next();

            if (result.value) {
                const diploma = JSON.parse(result.value.value.toString('utf8'));
                diplomas.push(diploma);
            }

            if (result.done) {
                await iterator.close();
                return diplomas;
            }
        }
    }
}

module.exports = DiplomaContract;
