export const GetIpfsUrlFromPinata = (pinataUrl) => {
    var IPFSUrlParts = pinataUrl.split("/");
    
    // Check 
    for (let i = 0; i < IPFSUrlParts.length - 1; i++) {
        if (IPFSUrlParts[i] === IPFSUrlParts[i+1]) {
            return null; 
        }
    }
    
    const lastIndex = IPFSUrlParts.length;
    const IPFSUrl = "https://ipfs.io/ipfs/" + IPFSUrlParts[lastIndex-1];
    return IPFSUrl;
};