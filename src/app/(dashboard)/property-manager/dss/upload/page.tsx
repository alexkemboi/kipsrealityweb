import DocumentUploadForm from "@/components/dss/DocumentUploadForm";

export default function DssUploadPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Document Signing</h1>
                <p className="text-gray-600">Upload a contract, define signers, and secure it on the blockchain.</p>
            </div>

            <DocumentUploadForm />
        </div>
    );
}
