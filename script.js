let rawData = [];
let filteredData = [];

const ROWS_PER_PAGE = 50;
let currentPage = 1;

document.addEventListener("DOMContentLoaded", () => {

    loadCSV();

    document
        .getElementById("searchBtn")
        .addEventListener("click", searchData);

    document
        .getElementById("copyBtn")
        .addEventListener("click", copySelected);

    document
        .getElementById("clearBtn")
        .addEventListener("click", clearAll);

    document
        .getElementById("prevPage")
        .addEventListener("click", previousPage);

    document
        .getElementById("nextPage")
        .addEventListener("click", nextPage);

});

function loadCSV(){

    Papa.parse("LL.csv",{

        download:true,
        header:true,
        skipEmptyLines:true,

        complete:function(results){

            rawData = results.data;
            filteredData = [...rawData];

            populateDropdowns();
            renderTable();

        },

        error:function(error){

            console.error(error);

        }

    });

}

function populateDropdowns(){

    const kdGabunganList = [
        ...new Set(
            rawData.map(x => x["Kd Gabungan"])
        )
    ];

    const kdCustomerList = [
        ...new Set(
            rawData.map(x => x["Kd Customer"])
        )
    ];

    fillSelect(
        "kdGabungan",
        kdGabunganList
    );

    fillSelect(
        "kdCustomer",
        kdCustomerList
    );

    $("#kdGabungan").select2({
        placeholder:"ALL",
        allowClear:true
    });

    $("#kdCustomer").select2({
        placeholder:"ALL",
        allowClear:true
    });

    $("#kdGabungan")
        .val("ALL")
        .trigger("change");

}

function fillSelect(id,data){

    const select =
        document.getElementById(id);

    select.innerHTML =
        '<option value="ALL">ALL</option>';

    data
        .filter(x => x)
        .sort()
        .forEach(item => {

            const option =
                document.createElement("option");

            option.value = item;
            option.textContent = item;

            select.appendChild(option);

        });

}

function compare(a,b,matchCase){

    a = String(a || "");
    b = String(b || "");

    if(matchCase){

        return a === b;

    }

    return a
        .toLowerCase()
        .includes(
            b.toLowerCase()
        );

}

function searchData(){

    const kdGabungan =
        document.getElementById(
            "kdGabungan"
        ).value;

    const kdCustomer =
        document.getElementById(
            "kdCustomer"
        ).value;

    const namaCustomer =
        document.getElementById(
            "namaCustomer"
        ).value.trim();

    const matchCase =
        document.getElementById(
            "matchCase"
        ).checked;

    filteredData =
        rawData.filter(row => {

            let valid = true;

            if(
                kdGabungan &&
                kdGabungan !== "ALL"
            ){

                valid =
                    valid &&
                    compare(
                        row["Kd Gabungan"],
                        kdGabungan,
                        matchCase
                    );

            }

            if(
                kdCustomer &&
                kdCustomer !== "ALL"
            ){

                valid =
                    valid &&
                    compare(
                        row["Kd Customer"],
                        kdCustomer,
                        matchCase
                    );

            }

            if(namaCustomer){

                if(matchCase){

                    valid =
                        valid &&
                        String(
                            row["Nama Customer"] || ""
                        ) === namaCustomer;

                }else{

                    valid =
                        valid &&
                        String(
                            row["Nama Customer"] || ""
                        )
                        .toLowerCase()
                        .includes(
                            namaCustomer.toLowerCase()
                        );

                }

            }

            return valid;

        });

    currentPage = 1;

    renderTable();

}

function clearAll(){

    $("#kdGabungan")
        .val("ALL")
        .trigger("change");

    $("#kdCustomer")
        .val(null)
        .trigger("change");

    document.getElementById(
        "namaCustomer"
    ).value = "";

    document
        .getElementById(
            "matchCase"
        ).checked = false;

    filteredData =
        [...rawData];

    currentPage = 1;

    renderTable();

}

function renderTable(){

    const tbody =
        document.getElementById(
            "resultTable"
        );

    const mobileResult =
        document.getElementById(
            "mobileResult"
        );

    tbody.innerHTML = "";
    mobileResult.innerHTML = "";

    const start =
        (currentPage - 1) *
        ROWS_PER_PAGE;

    const end =
        start +
        ROWS_PER_PAGE;

    const pageData =
        filteredData.slice(
            start,
            end
        );

    pageData.forEach((row,index)=>{

        tbody.innerHTML += `

        <tr>

            <td class="text-center">

                <input
                    type="checkbox"
                    class="form-check-input keep-checkbox"
                    data-index="${start+index}">

            </td>

            <td>
                ${row["Kd Gabungan"] || ""}
            </td>

            <td>
                ${row["Kd Customer"] || ""}
            </td>

            <td>

                <span class="badge badge-da mb-1">
                    ${row["Keterangan DA"] || "-"}
                </span>

                <br>

                ${row["Nama Customer"] || ""}

            </td>

            <td>
                ${row["Alamat Toko 1"] || ""}
            </td>

            <td>

                <button
                    class="btn btn-primary btn-sm"
                    onclick="copySingle(${start+index})">

                    <i class="fa-solid fa-copy"></i>

                </button>

            </td>

        </tr>

        `;

        mobileResult.innerHTML += `

        <div class="result-card">

            <div class="form-check">

                <input
                    type="checkbox"
                    class="form-check-input keep-checkbox"
                    id="keep_${start+index}"
                    data-index="${start+index}">

                <label
                    for="keep_${start+index}"
                    class="form-check-label">

                    Keep Result

                </label>

            </div>

            <div class="mb-2">

                <span class="badge badge-da">
                    ${row["Keterangan DA"] || "-"}
                </span>

            </div>

            <div class="result-card-title">
                ${row["Nama Customer"] || "-"}
            </div>

            <div class="result-card-item">
                <strong>Kd Gabungan :</strong>
                ${row["Kd Gabungan"] || ""}
            </div>

            <div class="result-card-item">
                <strong>Kd Customer :</strong>
                ${row["Kd Customer"] || ""}
            </div>

            <div class="result-card-item">
                <strong>Alamat :</strong>
                ${row["Alamat Toko 1"] || ""}
            </div>
            <button
                class="btn btn-primary btn-sm mb-3"
                onclick="copySingle(${start+index})">

                <i class="fa-solid fa-copy"></i>
                Copy To Clipboard

            </button>
        </div>

        `;

    });

    const totalPages =
        Math.ceil(
            filteredData.length /
            ROWS_PER_PAGE
        ) || 1;

    document
        .getElementById("pageInfo")
        .textContent =
        `${currentPage} / ${totalPages}`;

    document
        .getElementById("resultInfo")
        .textContent =
        `${filteredData.length} Data`;

}

function previousPage(){

    if(currentPage > 1){

        currentPage--;

        renderTable();

    }

}

function nextPage(){

    const totalPages =
        Math.ceil(
            filteredData.length /
            ROWS_PER_PAGE
        );

    if(currentPage < totalPages){

        currentPage++;

        renderTable();

    }

}

function getHari(value){

    const map = {

        "1":"Senin",
        "2":"Selasa",
        "3":"Rabu",
        "4":"Kamis",
        "5":"Jumat",
        "6":"Sabtu"

    };

    return `${value} (${map[value] || "-"})`;

}

function formatData(row){

    return `
*${row["Keterangan DA"] || "-"}*
*${row["Kd Site"] || ""}*
-------------
*Kd Gabungan* : ${row["Kd Gabungan"] || ""}
*Kd Site* : ${row["Kd Site"] || ""}
*Kd Customer* : ${row["Kd Customer"] || ""}
*Nama Customer* : ${row["Nama Customer"] || ""}
*Alamat Toko* : ${row["Alamat Toko 1"] || ""}
*Keterangan Kecamatan* : ${row["Keterangan Kecamatan"] || ""}
--------------
*Hari Kunjungan* : ${getHari(row["HP"] || "")}
*Kode Mapping* : ${row["Kd Agen"] || ""}
*Rute Kunjungan* : ${row["RUTE"] || ""}
`.trim();

}

function showToast(message){

    const toast =
        document.getElementById(
            "toastMessage"
        );

    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        ${message}
    `;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2000);

}

function copySingle(index){

    navigator.clipboard.writeText(
        formatData(
            filteredData[index]
        )
    );

    showToast(
        "Data berhasil disalin"
    );

}

function copySelected(){

    const selected = [];

    document
        .querySelectorAll(
            ".keep-checkbox:checked"
        )
        .forEach(cb => {

            selected.push(
                filteredData[
                    parseInt(
                        cb.dataset.index
                    )
                ]
            );

        });

    if(selected.length === 0){

        showToast(
            "Tidak ada data yang dipilih"
        );

        return;

    }

    const output =
        selected
        .map(item =>
            formatData(item)
        )
        .join("\n\n");

    navigator.clipboard.writeText(
        output
    );

    showToast(
        `${selected.length} data berhasil disalin`
    );

}